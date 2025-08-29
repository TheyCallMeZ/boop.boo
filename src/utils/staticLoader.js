// src/utils/staticLoader.js
export const getDataFiles = (source = "static") => {
  const contexts = {
    static: require.context("@/assets/data/static/", false, /\.json$/),
    fc: require.context("@/assets/data/fc/", false, /\.json$/),
  };

  const context = contexts[source] || contexts.static;

  const files = context.keys().map((key) => {
    const fileData = context(key);
    console.log("Loading file:", key);
    console.log("File data:", fileData);

    return {
      data: fileData.mounts,
      player: fileData.name,
      job: fileData.job,
      homeWorld: fileData.homeWorld,
      profileUrl: fileData.profileUrl,
      status: fileData.status,
    };
  });

  console.log("Processed files:", files);
  return files;
};
