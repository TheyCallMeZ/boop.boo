const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

class StaticMember {
  constructor(data) {
    if (typeof data === "object" && data !== null) {
      // Constructor from object (like JSON)
      this.name = data.name;
      this.job = data.job;
      this.homeWorld = data.homeWorld;
      this.lodestoneId = data.lodestoneId;
      this.status = data.status;
      this.profileUrl = `https://na.finalfantasyxiv.com/lodestone/character/${this.lodestoneId}`;
      this.mountUrl = `${this.profileUrl}/mount`;
      this.mounts = data.mounts || [];
    } else {
      // Constructor from parameters
      const [name, job, homeWorld, lodestoneId, status] = arguments;
      this.name = name;
      this.job = job;
      this.homeWorld = homeWorld;
      this.lodestoneId = lodestoneId;
      this.profileUrl = `https://na.finalfantasyxiv.com/lodestone/character/${lodestoneId}`;
      this.mountUrl = `${this.profileUrl}/mount`;
      this.status = status;
      this.mounts = [];
    }
  }
}

class Mount {
  constructor(id, name, expansion = "", fight = "", content = "") {
    this.ID = id;
    this.Name = name;
    this.Expansion = expansion;
    this.Fight = fight;
    this.Content = content;
  }
}

class MountScraper {
  constructor(mode = "static") {
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    this.mountData = [];
    this.mode = (mode || "static").toLowerCase() === "fc" ? "fc" : "static";
    this.staticMembers = [];
  }

  // Helper function to remove BOM (Byte Order Mark) from string
  removeBOM(str) {
    if (str.charCodeAt(0) === 0xfeff) {
      return str.slice(1);
    }
    return str;
  }

  async loadData() {
    try {
      // Load mount data
      let mountJson = await fs.readFile("mounts.json", "utf8");
      mountJson = this.removeBOM(mountJson); // Remove BOM if present
      this.mountData = JSON.parse(mountJson);
      console.log(`✅ Loaded ${this.mountData.length} mounts from JSON file`);

      // Load members based on mode
      const membersFile =
        this.mode === "fc" ? "fc_members.json" : "static_members.json";
      let membersJson = await fs.readFile(membersFile, "utf8");
      membersJson = this.removeBOM(membersJson); // Remove BOM if present
      const membersData = JSON.parse(membersJson);
      this.members = membersData.map((member) => new StaticMember(member));
      console.log(
        `✅ Loaded ${this.members.length} ${this.mode} members from JSON file (${membersFile})`
      );

      // Create output directories
      await this.createOutputDirectories();
    } catch (error) {
      console.error(`❌ Error loading JSON files: ${error.message}`);
      console.error(
        `💡 If you're getting JSON parse errors, your file might have a BOM (Byte Order Mark).`
      );
      console.error(
        `💡 Try saving your JSON files as "UTF-8 without BOM" in your text editor.`
      );
      throw error;
    }
  }

  async createOutputDirectories() {
    try {
      // Remove old output directory
      await fs.rm("./output", { recursive: true, force: true });

      // Create new directories
      await fs.mkdir("./output/unidentified", { recursive: true });
      await fs.mkdir("./output/have", { recursive: true });
      await fs.mkdir("./output/need", { recursive: true });
    } catch (error) {
      console.error(`Error creating directories: ${error.message}`);
    }
  }

  async scrapeMountsFromPage(member) {
    const foundMounts = [];
    const unknownMounts = [];

    try {
      // Download the web page
      const response = await this.httpClient.get(member.mountUrl);
      const html = response.data;

      // Load HTML with cheerio
      const $ = cheerio.load(html);

      // Get character name and sanitize it for filename
      const characterNameElement = $(".frame__chara__name");
      let characterName = "unknown";

      if (characterNameElement.length > 0) {
        characterName = characterNameElement.text().trim();
        // Sanitize filename
        characterName = characterName.replace(/[^a-zA-Z0-9\s]/g, "_");
        characterName = characterName.replace(/\s+/g, "_");
      }

      console.log(`Processing: ${characterName}`);

      // Find all mount list items
      const mountNodes = $(".character__mounts .mount__list_icon");

      mountNodes.each((index, element) => {
        const tooltipHref = $(element).attr("data-tooltip_href") || "";

        // Extract mount ID using regex
        const match = tooltipHref.match(/\/mount\/tooltip\/([a-f0-9]+)/);
        if (match) {
          const mountId = match[1];

          // Look up mount in the list
          const mount = this.mountData.find((m) => m.ID === mountId);
          if (mount) {
            foundMounts.push(mount);
          } else {
            unknownMounts.push(new Mount(mountId, "Unknown Mount"));
          }
        }
      });

      // Update member with found mounts
      member.mounts = foundMounts;

      // Find needed mounts
      const neededMounts = this.mountData.filter(
        (m) => !foundMounts.some((f) => f.ID === m.ID)
      );

      // Save files
      await this.saveResults(
        characterName,
        member,
        unknownMounts,
        neededMounts
      );

      return foundMounts;
    } catch (error) {
      console.error(`Error processing ${member.name}: ${error.message}`);
      throw error;
    }
  }

  async saveResults(characterName, member, unknownMounts, neededMounts) {
    const options = { indent: 2 }; // For pretty JSON formatting

    try {
      // Save unknown mounts
      await fs.writeFile(
        `./output/unidentified/${characterName}_unk_mounts.json`,
        JSON.stringify(unknownMounts, null, 2)
      );

      // Save found mounts (member with mounts)
      await fs.writeFile(
        `./output/have/${characterName}_found_mounts.json`,
        JSON.stringify(member, null, 2)
      );

      // Save needed mounts
      await fs.writeFile(
        `./output/need/${characterName}_needed.json`,
        JSON.stringify(neededMounts, null, 2)
      );
    } catch (error) {
      console.error(
        `Error saving files for ${characterName}: ${error.message}`
      );
    }
  }

  async copyFilesToDestination() {
    if (process.platform !== "win32") {
      console.log("Not on Windows, skipping file copy to C: drive");
      return;
    }

    try {
      const sourceDirectory = "./output/have";
      //const destinationDirectory = 'C:\\git\\boop.boo\\src\\assets\\data\\static';
      const destinationDirectory =
        this.mode === "fc"
          ? "../src/assets/data/fc"
          : "../src/assets/data/static";

      // Clear destination directory
      try {
        const files = await fs.readdir(destinationDirectory);
        await Promise.all(
          files.map((file) => fs.unlink(path.join(destinationDirectory, file)))
        );
        console.log(`All files in ${destinationDirectory} have been deleted.`);
      } catch (error) {
        // Directory might not exist
        await fs.mkdir(destinationDirectory, { recursive: true });
      }

      // Copy files
      const sourceFiles = await fs.readdir(sourceDirectory);
      await Promise.all(
        sourceFiles.map(async (file) => {
          const sourcePath = path.join(sourceDirectory, file);
          const destPath = path.join(destinationDirectory, file);
          await fs.copyFile(sourcePath, destPath);
        })
      );

      console.log("Files successfully copied to the static data directory.");
    } catch (error) {
      console.error(`Error copying files: ${error.message}`);
    }
  }

  async run() {
    try {
      await this.loadData();

      // Process each member
      for (const member of this.members) {
        try {
          await this.scrapeMountsFromPage(member);
        } catch (error) {
          console.error(`Error processing ${member.name}`);
          console.error(`${member.mountUrl}: ${error.message}`);
        }
      }

      // Copy files if on Windows
      await this.copyFilesToDestination();

      console.log("Processing completed successfully!");
    } catch (error) {
      console.error(`Fatal error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the scraper
async function main() {
  const arg = (process.argv[2] || "static").toLowerCase();
  const mode = arg === "fc" || arg === "static" ? arg : "static";
  if (arg !== mode) {
    console.warn(`Unrecognized mode "${arg}". Defaulting to "static".`);
  }

  const scraper = new MountScraper(mode);
  await scraper.run();
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

module.exports = { MountScraper, StaticMember, Mount };
