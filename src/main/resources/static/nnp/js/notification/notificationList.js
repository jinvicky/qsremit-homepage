$(document).ready(function () {
	const table = new DataTable("#notificationTable", {
		data: [
	        {
	            "No": 1,
	            "Date": "QP1731391421071",
	            "Title": "120,000",
	            "Detail": "120,000",
	            "DisplayAlways": "120,000",
	            "Writer": "120,000",
	        },
	    ],
        rowId: "No",
		columns: [
	        { data: "No" },
	        { data: "Date" },
	        { data: "Title" },
	        { data: "Detail" },
	        { data: "DisplayAlways" },
	        { data: "Writer" },
	    ],
	});

	table.on("click", function() {
		searchTable(table, "#searchText", $("#columnSelect").val())

	    table.draw();
	})
	
	table.on("click", "tbody tr", function() {
		const row = table.row($(this).closest("tr")).data();
		window.location.href = `/notification/notificationEdit?id=${row.No}`
	})
	
	searchTableByButtons(table, ".language-btn", 4)
});