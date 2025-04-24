// src/utils/staticLoader.js
export const getDataFiles = () => {
  const context = require.context("@/assets/data/static/", false, /\.json$/);

  const files = context.keys().map((key) => {
    const fileData = context(key);
    //console.log("Loading file:", key);
    //console.log("File data:", fileData);

    return {
      data: fileData.Mounts,
      player: fileData.name,
      job: fileData.job,
      homeWorld: fileData.homeWorld,
      profileUrl: fileData.ProfileUrl,
      status: fileData.status,
    };
  });

  //console.log("Processed files:", files);
  return files;
};
