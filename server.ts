import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload parser limits for handling larger images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Ensure uploads directory exists on disk
  const uploadsDir = path.join(process.cwd(), "public", "uploaded_images");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Helper to read files recursively from uploads directory
  function getFilesRecursively(dir: string, baseDir: string = ""): any[] {
    let results: any[] = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFilesRecursively(fullPath, baseDir ? `${baseDir}/${file}` : file));
      } else {
          const ext = path.extname(file).toLowerCase();
          if (['.png', '.jpeg', '.jpg', '.gif', '.webp', '.svg'].includes(ext)) {
            const relativeFolder = baseDir || "Root";
            const urlStr = baseDir ? `/uploaded_images/${baseDir}/${file}` : `/uploaded_images/${file}`;
            const sizeStr = `${(stat.size / 1024).toFixed(1)} KB`;
            const baseName = file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").substring(14); // strip timestamp if any

            // Extract timestamp if available, otherwise compute a stable numerical hash
            const matchTimestamp = file.match(/^(\d+)_/);
            let numericId = "";
            if (matchTimestamp) {
              numericId = matchTimestamp[1];
            } else {
              let hash = 0;
              const fullStr = `${baseDir}/${file}`;
              for (let i = 0; i < fullStr.length; i++) {
                hash = (hash << 5) - hash + fullStr.charCodeAt(i);
                hash |= 0;
              }
              numericId = String(Math.abs(hash));
            }

            results.push({
              id: numericId,
              name: file,
              size: sizeStr,
              url: urlStr,
              category: 'Product',
              folder: relativeFolder,
              altText: `${baseName || file} photo asset`,
              caption: `Discovered image inside ${relativeFolder}`
            });
          }
      }
    });
    return results;
  }

  // API list routed to grab folders/images
  const configPath = path.join(process.cwd(), "supabase_shared_config.json");

  app.post("/api/save-supabase-config", (req, res) => {
    try {
      const { url, anonKey, serviceRoleKey, bucketName, databaseSchema } = req.body;
      const config = { url, anonKey, serviceRoleKey, bucketName, databaseSchema };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
      res.json({ success: true, message: "Supabase configuration stored on backend successfully." });
    } catch (err: any) {
      console.error("Error saving Supabase config:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/supabase-config", (req, res) => {
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf-8");
        const parsed = JSON.parse(raw);
        return res.json({
          success: true,
          url: parsed.url || "",
          anonKey: parsed.anonKey || "",
          bucketName: parsed.bucketName || "goldiama-bucket",
          databaseSchema: parsed.databaseSchema || "public"
        });
      }
      res.json({
        success: false,
        message: "No shared configuration found on server."
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/list-images", (req, res) => {
    try {
      const files = getFilesRecursively(uploadsDir);
      // Collect all unique folder names
      const folders = Array.from(new Set(files.map(f => f.folder)));
      if (!folders.includes("Root")) {
        folders.unshift("Root");
      }
      res.json({
        success: true,
        files,
        folders
      });
    } catch (err: any) {
      console.error("Error listing images:", err);
      res.status(500).json({ error: err.message || "Failed to list files" });
    }
  });

  // API upload route
  app.post("/api/upload-image", (req, res) => {
    try {
      const { name, dataUrl, folder } = req.body;
      if (!name || !dataUrl) {
        return res.status(400).json({ error: "Missing name or dataUrl" });
      }

      // Check for clean base64 dataUrl format
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid dataUrl format" });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Create a unique file name
      const ext = name.split('.').pop() || 'png';
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const fileName = `${Date.now()}_${cleanName}.${ext}`;

      // Resolve subfolder if any
      let targetFolderDir = uploadsDir;
      let folderPathStr = "";
      if (folder) {
        const cleanFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, '_').trim();
        if (cleanFolder) {
          targetFolderDir = path.join(uploadsDir, cleanFolder);
          folderPathStr = cleanFolder;
          if (!fs.existsSync(targetFolderDir)) {
            fs.mkdirSync(targetFolderDir, { recursive: true });
          }
        }
      }

      const filePath = path.join(targetFolderDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = folderPathStr 
        ? `/uploaded_images/${folderPathStr}/${fileName}`
        : `/uploaded_images/${fileName}`;

      res.json({
        success: true,
        url: fileUrl,
        name: fileName,
        folder: folderPathStr || "Root",
        size: `${(buffer.length / 1024).toFixed(1)} KB`
      });
    } catch (err: any) {
      console.error("Error saving image:", err);
      res.status(500).json({ error: err.message || "Failed to save file" });
    }
  });

  // --- VERCEL/VERSAL BLOB STORAGE CLOUD ENDPOINTS ---
  app.get("/api/blob/config", (req, res) => {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      const envTokenExists = !!token;
      let maskedToken = "";
      if (envTokenExists && token) {
        maskedToken = token.substring(0, 10) + "••••••••" + token.substring(token.length - 4);
      }
      res.json({
        envTokenExists,
        maskedToken
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/blob/list", async (req, res) => {
    try {
      const customToken = (req.query.token as string) || process.env.BLOB_READ_WRITE_TOKEN;
      if (!customToken) {
        return res.json({ success: false, blobs: [], message: "No active token configure." });
      }
      // Dynamic import of @vercel/blob
      const { list } = await import('@vercel/blob');
      const result = await list({ token: customToken });
      res.json({ success: true, blobs: result.blobs });
    } catch (err: any) {
      console.error("Error listing vercel blobs:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to query Vercel storage" });
    }
  });

  app.post("/api/blob/upload", async (req, res) => {
    try {
      const { name, dataUrl, folder, token } = req.body;
      const activeToken = token || process.env.BLOB_READ_WRITE_TOKEN;
      if (!activeToken) {
        return res.status(400).json({ error: "BLOB_READ_WRITE_TOKEN is missing. Please configure it under Settings." });
      }
      if (!name || !dataUrl) {
        return res.status(400).json({ error: "Missing filename or image raw data representation" });
      }

      // Check base64 format match
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Encoded base64 dataUrl is invalid or corrupt" });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Create folder-aware path if defined
      const vercelPath = folder && folder !== "Root" ? `${folder}/${name}` : name;

      const { put } = await import('@vercel/blob');
      const blob = await put(vercelPath, buffer, {
        access: 'public',
        contentType: mimeType,
        token: activeToken,
      });

      res.json({
        success: true,
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        size: `${(buffer.length / 1024).toFixed(1)} KB`
      });
    } catch (err: any) {
      console.error("Vercel Blob upload failed:", err);
      res.status(500).json({ error: err.message || "Upload process failed" });
    }
  });

  app.post("/api/blob/delete", async (req, res) => {
    try {
      const { url, token } = req.body;
      const activeToken = token || process.env.BLOB_READ_WRITE_TOKEN;
      if (!activeToken) {
        return res.status(400).json({ error: "Missing valid read_write authentication token" });
      }
      if (!url) {
        return res.status(400).json({ error: "Image resource URL parameter is required for deletion" });
      }

      const { del } = await import('@vercel/blob');
      await del(url, { token: activeToken });
      res.json({ success: true, message: "Asset purged from Vercel Storage successfully" });
    } catch (err: any) {
      console.error("Vercel Blob deletion failed:", err);
      res.status(500).json({ error: err.message || "Deletion process failed" });
    }
  });

  // --- ANY S3-COMPATIBLE CLOUD STORAGE UPLOAD PROXY ---
  app.post("/api/storage/s3/upload", async (req, res) => {
    try {
      const { name, dataUrl, folder, settings } = req.body;
      if (!settings) {
        return res.status(400).json({ error: "Missing S3 configuration credentials." });
      }
      const { endpoint, bucket, accessKey, secretKey, region } = settings;
      
      if (!bucket || !accessKey || !secretKey || !region) {
        return res.status(400).json({ error: "Missing required S3 credentials parameters (bucket, accessKey, secretKey, region)." });
      }

      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Encoded base64 dataUrl is invalid or corrupt" });
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      const s3Path = folder && folder !== "Root" ? `${folder}/${name}` : name;
      
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      
      const config: any = {
        region: region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        }
      };

      if (endpoint && endpoint.trim()) {
        config.endpoint = endpoint;
        config.forcePathStyle = true; 
      }
      
      const s3 = new S3Client(config);
      
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: s3Path,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read' 
      }));
      
      let finalUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Path}`;
      if (endpoint) {
        const cleanedHost = endpoint.replace(/^https?:\/\//, '');
        // handle clean hostname join
        finalUrl = endpoint.endsWith('/') ? `${endpoint}${bucket}/${s3Path}` : `${endpoint}/${bucket}/${s3Path}`;
      }
      
      res.json({
        success: true,
        url: finalUrl,
        name: name,
        folder: folder || "Root",
        size: `${(buffer.length / 1024).toFixed(1)} KB`
      });
    } catch (err: any) {
      console.error("S3 upload failed:", err);
      res.status(500).json({ error: err.message || "S3 Upload failed" });
    }
  });

  // --- CUSTOM HTTP API GATEWAY / WEBHOOK UPLOAD PROXY ---
  app.post("/api/storage/custom-api/upload", async (req, res) => {
    try {
      const { name, dataUrl, folder, settings } = req.body;
      if (!settings) {
        return res.status(400).json({ error: "Missing custom API configurations." });
      }
      const { apiUrl, headers, payloadType, keyName, urlSelector } = settings;
      
      if (!apiUrl) {
        return res.status(400).json({ error: "Missing Custom API URL endpoint." });
      }
      
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Encoded base64 dataUrl is invalid or corrupt" });
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      let fetchBody: any = null;
      let fetchHeaders: Record<string, string> = {};
      
      if (headers) {
        try {
          fetchHeaders = JSON.parse(headers);
        } catch (pErr) {
          console.warn("Failed to parse custom JSON headers:", pErr);
        }
      }
      
      if (payloadType === 'json-base64') {
        fetchBody = JSON.stringify({
          [keyName || 'image']: dataUrl,
          filename: name,
          folder: folder || 'Root'
        });
        fetchHeaders['Content-Type'] = 'application/json';
      } else {
        const formData = new FormData();
        const blob = new Blob([buffer], { type: mimeType });
        formData.append(keyName || 'file', blob, name);
        if (folder) {
          formData.append('folder', folder);
        }
        fetchBody = formData;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: fetchHeaders,
        body: fetchBody
      });
      
      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `Custom upload receiver returned status ${response.status}: ${errText.substring(0, 150)}` });
      }
      
      const apiResponse = await response.json();
      
      let extractedUrl = "";
      if (urlSelector) {
        const parts = urlSelector.split('.');
        let current = apiResponse;
        for (const part of parts) {
          if (current && typeof current === 'object') {
            current = current[part];
          } else {
            current = undefined;
          }
        }
        extractedUrl = String(current || "");
      } else {
        extractedUrl = apiResponse.url || apiResponse.secure_url || apiResponse.data?.url || "";
      }
      
      if (!extractedUrl) {
        return res.status(400).json({ error: `Could not parse URL from response. Response: ${JSON.stringify(apiResponse).substring(0, 150)}. Selector used: "${urlSelector || 'default'}"` });
      }
      
      res.json({
        success: true,
        url: extractedUrl,
        name: name,
        folder: folder || "Root",
        size: `${(buffer.length / 1024).toFixed(1)} KB`
      });
    } catch (err: any) {
      console.error("Custom API upload failed:", err);
      res.status(500).json({ error: err.message || "Custom API Upload failed" });
    }
  });

  // --- CENTRALIZED BACKEND STORE FOR REPLICATING STATE & REMOVING VISITOR LOCALSTORAGE CACHING ---
  const storeStatePath = path.join(process.cwd(), "store_state_db.json");

  app.get("/api/store-state", (req, res) => {
    try {
      if (fs.existsSync(storeStatePath)) {
        const raw = fs.readFileSync(storeStatePath, "utf-8");
        return res.json({ success: true, data: JSON.parse(raw) });
      }
      res.json({ success: true, data: {} });
    } catch (err: any) {
      console.error("Error loading store state:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/store-state", (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ success: false, error: "Missing key parameter" });
      }
      let currentData: Record<string, any> = {};
      if (fs.existsSync(storeStatePath)) {
        try {
          currentData = JSON.parse(fs.readFileSync(storeStatePath, "utf-8"));
        } catch (e) {
          currentData = {};
        }
      }
      currentData[key] = value;
      fs.writeFileSync(storeStatePath, JSON.stringify(currentData, null, 2), "utf-8");
      res.json({ success: true, message: "State synchronized on central backend storage successfully." });
    } catch (err: any) {
      console.error("Error saving store state:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Serve static uploaded_images folder directly
  app.use("/uploaded_images", express.static(uploadsDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
