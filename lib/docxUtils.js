import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export const generateEventDocx = async (events) => {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: events.flatMap((event, index) => {
                    const sections = [
                        new Paragraph({
                            text: event.heading,
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 400, after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: event.description,
                                    size: 24, // 12pt
                                }),
                            ],
                            spacing: { after: 400 },
                        }),
                    ];

                    // Add image links if they exist
                    if (event.images && event.images.length > 0) {
                        sections.push(
                            new Paragraph({
                                text: "Included Images:",
                                heading: HeadingLevel.HEADING_3,
                                spacing: { after: 100 },
                            })
                        );
                        event.images.forEach((img, i) => {
                            sections.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `Image ${i + 1}: `,
                                            bold: true,
                                        }),
                                        new TextRun({
                                            text: img,
                                            color: "0000FF",
                                            underline: {},
                                        }),
                                    ],
                                })
                            );
                        });
                    }

                    // Add page break between events except the last one
                    if (index < events.length - 1) {
                        sections.push(
                            new Paragraph({
                                text: "",
                                pageBreakBefore: true,
                            })
                        );
                    }

                    return sections;
                }),
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Yogit_Gupta_Events.docx");
};
