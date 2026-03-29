import { exec } from "child_process";

export function createCluster(orgId: string): void {
  exec(`k3d cluster create org-${orgId}`, (error) => {
    if (error) {
      throw error;
    }
  });
}
