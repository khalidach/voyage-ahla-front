const bcrypt = require("bcryptjs");

const plainPassword = "Khalidach2003@"; // Replace with your desired plaintext password

async function generateHash() {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(plainPassword, salt); // Hash the password
    console.log("Plain Password:", plainPassword);
    console.log("Hashed Password:", hashedPassword);
  } catch (error) {
    console.error("Error generating hash:", error);
  }
}

generateHash();
