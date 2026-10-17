export async function validateProjectVideo(file: File): Promise<void> {
  if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
    throw new Error("Selecciona un video MP4, WebM o MOV.");
  }
  if (file.size > 100 * 1024 * 1024) {
    throw new Error("El video supera los 100 MB.");
  }
  await new Promise<void>((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const finish = (error?: string) => {
      clearTimeout(timeout);
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
      if (error) reject(new Error(error));
      else resolve();
    };
    const timeout = setTimeout(() => finish("No se pudo verificar la duración del video."), 15000);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        finish("No se pudo verificar la duración del video.");
      } else if (video.duration > 120) {
        finish("El video supera los 2 minutos. Selecciona uno de hasta 2 minutos.");
      } else finish();
    };
    video.onerror = () => finish("No se pudo leer el video. Prueba con MP4 o WebM.");
    video.src = url;
  });
}
