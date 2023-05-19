/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office, Word */
import { base64Image } from "../../base64Image";

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    // Assign event handlers and other initialization logic.
    document.getElementById("insert-paragraph").onclick = () => tryCatch(insertParagraph);
    document.getElementById("apply-style").onclick = () => tryCatch(applyStyle);
    document.getElementById("apply-custom-style").onclick = () => tryCatch(applyCustomStyle);
    document.getElementById("change-font").onclick = () => tryCatch(changeFont);
    document.getElementById("insert-text-into-range").onclick = () => tryCatch(insertTextIntoRange);
    document.getElementById("insert-text-outside-range").onclick = () => tryCatch(insertTextBeforeRange);
    document.getElementById("replace-text").onclick = () => tryCatch(replaceText);
    document.getElementById("insert-image").onclick = () => tryCatch(insertImage);
    document.getElementById("insert-html").onclick = () => tryCatch(insertHTML);

    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
  }
});

async function insertParagraph() {
  await Word.run(async (context) => {
    // Queue commands to insert a paragraph into the document.
    const docBody = context.document.body;
    docBody.insertParagraph(
      "Office has several versions, including Office 2016, Microsoft 365 subscription, and Office on the web.",
      Word.InsertLocation.start
    );

    await context.sync();
  });
}

async function applyStyle() {
  await Word.run(async (context) => {
    // Queue commands to style text.
    const firstParagraph = context.document.body.paragraphs.getFirst();
    firstParagraph.styleBuiltIn = Word.Style.intenseReference;

    await context.sync();
  });
}

async function applyCustomStyle() {
  await Word.run(async (context) => {
    // Queue commands to apply the custom style.
    const lastParagraph = context.document.body.paragraphs.getLast();
    lastParagraph.style = "MyCustomStyle";

    await context.sync();
  });
}

async function changeFont() {
  await Word.run(async (context) => {
    // Queue commands to apply a different font.
    const secondParagraph = context.document.body.paragraphs.getFirst().getNext();
    secondParagraph.font.set({
      name: "Courier New",
      bold: true,
      size: 18,
    });

    await context.sync();
  });
}

/**
 * The function is intended to insert the abbreviation ["(M365)"]
 * into the end of the Range whose text is "Microsoft 365". It makes a
 * simplifying assumption that the string is present and the user has selected it.
 */
async function insertTextIntoRange() {
  await Word.run(async (context) => {
    // 1. Queue commands to insert text into a selected range.
    const doc = context.document;
    const originalRange = doc.getSelection();
    originalRange.insertText(" (M365)", Word.InsertLocation.end);

    // 2. Load the text of the range and sync so that the current range text can be read.
    originalRange.load("text");
    await context.sync();

    // 3. Queue commands to repeat the text of the original range at the end of the document.
    doc.body.insertParagraph("Original range: " + originalRange.text, Word.InsertLocation.end);

    await context.sync();
  });
}

/**
 * The function is intended to add a range whose text is "Office 2019, "
 * before the range with text "Microsoft 364". It makes an assumption that
 * the string is present and the user has selected it.
 */
async function insertTextBeforeRange() {
  await Word.run(async (context) => {
    // 1. Queue commands to insert a new range before the selected range.
    const doc = context.document;
    const originalRange = doc.getSelection();
    originalRange.insertText("Office 2019, ", Word.InsertLocation.before);

    // 2. Load the text of the original range and sync so that the range text can be read and inserted.
    originalRange.load("text");
    await context.sync();

    // 3. Queue commands to insert the original range as a paragraph at the end of the document.
    // This new paragraph will demonstrate the fact that the new text is not part of the original selected range. The original range still has only the text it had when it was selected.
    doc.body.insertParagraph("Current text of original range: " + originalRange.text, Word.InsertLocation.end);

    // 4. Make a final call of context.sync here and ensure that it runs after the insertParagraph has been queued.
    await context.sync();
  });
}

/**
 * The function is intended to replace the string "several"
 * with the string "many". It makes a simplifying assumption
 * that the string is present and the user has selected it.
 */
async function replaceText() {
  await Word.run(async (context) => {
    // 1. Queue commands to replace the text.
    const doc = context.document;
    const originalRange = doc.getSelection();
    originalRange.insertText("many", Word.InsertLocation.replace);

    await context.sync();
  });
}

async function insertImage() {
  await Word.run(async (context) => {
    // 1. Queue commands to insert an image.
    context.document.body.insertInlinePictureFromBase64(base64Image, Word.InsertLocation.end);

    await context.sync();
  });
}

async function insertHTML() {
  await Word.run(async (context) => {
    // 1. Queue commands to insert a string of HTML.
    // Adds a blank paragraph to the end of the document
    const blankParagraph = context.document.body.paragraphs.getLast().insertParagraph("", Word.InsertLocation.after);

    // Inserts a string of HTML at the end of the paragraph;
    // specifically two paragraphs, one formatted with the Verdana font,
    // the other with the default styling of the Word document. (As you saw
    // in the insertImage method earlier, the context.document.body object also has the insert* methods.)
    blankParagraph.insertHtml(
      '<p style="font-family: verdana;">Inserted HTML.</p><p>Another paragraph</p>',
      Word.InsertLocation.end
    );

    await context.sync();
  });
}

/** Default helper for invoking an action and handling errors. */
async function tryCatch(callback) {
  try {
    await callback();
  } catch (error) {
    // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
    // eslint-disable-next-line no-undef
    console.error(error);
  }
}
