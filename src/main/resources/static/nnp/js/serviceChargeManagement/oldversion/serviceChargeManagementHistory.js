$(document).ready(function() {
	const editor = new DataTable.Editor({
	    ajax: "/nnp/data/dummyData.json",
	    idSrc: "no",
	    fields: [
	    	{ label: "no", name: "no" },                     
            { label: "remitter", name: "remitter" },                
            { label: "payoutCountry", name: "payoutCountry" },           
            { label: "payoutPartner", name: "payoutPartner" },          
            { label: "headOffice usdJpy", name: "headOffice.usdJpy" },  
            { label: "headOffice cost", name: "headOffice.cost" },       
            { label: "headOffice margin", name: "headOffice.margin" },   
            { label: "agentMargin settle", name: "agentMargin.settle" },   
            { label: "agentMargin margin", name: "agentMargin.margin" },      
            { label: "agentMargin cust", name: "agentMargin.cust" },        
            { label: "customerRate settle", name: "customerRate.settle" },   
            { label: "customerRate custMobileCust", name: "customerRate.custMobileCust" }, 
            { label: "update", name: "update", type: "datetime"}  
	    ],
	    table: "#history-table"
	});
	
	const table = new DataTable("#history-table", {
		ajax: {
            url: "/nnp/data/dummyData.json", 
            dataSrc: "data",
        },
        scrollY: "350px",
        scrollX: true,
        scrollCollapse: true, 
        searching: true,
        rowId: "no",
        columns: [
            { data: "no" },                     
            { data: "remitter", className: "editable", searchable: true },                
            { data: "payoutCountry", className: "editable", searchable: true},           
            { data: "payoutPartner", searchable: true},          
            { data: "headOffice.usdJpy", render: function(data) { return format(data); } },
            { data: "headOffice.cost", render: function(data) { return format(data); } },
            { data: "headOffice.margin", render: function(data) { return format(data); } },
            { data: "agentMargin.settle", render: function(data) { return format(data); } },
            { data: "agentMargin.margin", render: function(data) { return format(data); } },
            { data: "agentMargin.cust", render: function(data) { return format(data); } },
            { data: "customerRate.settle", render: function(data) { return format(data); } },
            { data: "customerRate.custMobileCust", className: "editable", render: function(data) { return format(data); } },
            { data: "update",  render: function (data, type, row) {
                return moment(data).format("YYYY-MM-DD h:mm:ss");
            }, searchable: true}  
        ],
	});
	
	table.on("click", "tbody td.editable", function (e) {
	    editor.inline(this);
	});
	
	$.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
	    const startDate = new Date($("#start-date").val());
	    const endDate = new Date($("#end-date").val());
	    const date = new Date(data[12]);

	    const isStartDateValid = !isNaN(startDate.getTime());
	    const isEndDateValid = !isNaN(endDate.getTime());
	    const isDateValid = !isNaN(date.getTime());

	    if (!isDateValid) return false;

	    if (
	        (isStartDateValid && date < startDate) ||
	        (isEndDateValid && date > endDate)
	    ) {
	        return false;
	    }

	    return true;
	});
	
	$("#search-btn").on("click", function() {
		searchTable(table, "#remmitter-select", 1)
		searchTable(table, "#payout-country-select", 2)
		searchTable(table, "#payout-partner-select", 3)

	    table.draw();
	})

    function format(data) {
        if (data === null || data === 0) {
            return 0;
        }
        return Number(data).toLocaleString(); // 숫자를 3자리 단위로 반점 표시
    }
});