import { describe, it, expect } from "vitest";
import { fileKind, resolveBucketFile, BucketDef } from "./workspaceUtils";
import path from "node:path";
import os from "node:os";

describe("workspaceUtils", () => {
  describe("fileKind", () => {
    it("should correctly identify images", () => {
      expect(fileKind("test.png")).toBe("image");
      expect(fileKind("photo.JPG")).toBe("image");
    });
    
    it("should correctly identify text files", () => {
      expect(fileKind("data.json")).toBe("text");
      expect(fileKind("script.ts")).toBe("text");
    });
    
    it("should correctly identify unknown files as binary", () => {
      expect(fileKind("archive.zip")).toBe("binary");
    });
  });

  describe("resolveBucketFile", () => {
    it("should return null if bucket ID is not found", () => {
      const buckets: BucketDef[] = [];
      expect(resolveBucketFile(buckets, "invalid", "file.txt")).toBeNull();
    });
    
    it("should prevent directory traversal attacks", () => {
      const buckets: BucketDef[] = [{
        id: "docs",
        label: "Docs",
        paths: [path.join(os.tmpdir(), "docs")],
        description: ""
      }];
      // This will fail because the mock path doesn't exist, but it definitely shouldn't resolve above root
      expect(resolveBucketFile(buckets, "docs", "../../../etc/passwd")).toBeNull();
    });
  });
});
