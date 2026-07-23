const handleExportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18);
  doc.text("Intellysis Digital - Timesheet Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,

    head: [[
      "Task",
      "Project",
      "Category",
      "Date",
      "Start",
      "End",
      "Status",
      "Description",
    ]],

    body: entries.map((entry) => [
      entry.taskName,
      entry.project,
      entry.category,
      entry.date,
      entry.startTime,
      entry.endTime,
      entry.status,
      entry.description || "",
    ]),

    styles: {
      fontSize: 8,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save("Timesheet_Report.pdf");
};