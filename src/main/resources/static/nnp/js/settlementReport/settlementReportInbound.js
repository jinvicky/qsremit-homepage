import AutoNumeric from "../../libs/DataTables/datatables";

$(document).ready(function () {
	const table = new DataTable("#settlementInboundTable", {
		data: [
	        {
	            "No": 1,
	            "TxnID": "QP1731391421071",
	            "JPY": {
	                "CollectedAmount": "138,748",
	                "TransferAmount": "137,748",
	                "ServiceCharge": "1000",					
	            },
	            "Doller": {
	                "CollectedAmount": "897.336",
	                "TransferAmount": "890.8686",
	                "ServiceCharge": "6.4674",		
	            },
	            "Bills": "120,000",
	        },
	    ],
        rowId: "No",
		columns: [
	        { data: "No" },
	        { data: "TxnID" },
	        { data: "JPY.CollectedAmount",
				render: function (data) {
					return AutoNumeric.format(data, {
						digitGroupSeparator: ",",
						decimalCharacter: ".",
						decimalPlaces: 0
					});
				}
			},
	        { data: "JPY.TransferAmount",
				render: function (data) {
					return AutoNumeric.format(data, {
						digitGroupSeparator: ",",
						decimalCharacter: ".",
						decimalPlaces: 0
					});
				}
			},
	        { data: "JPY.ServiceCharge" },
	        { data: "Doller.CollectedAmount",
				render: function (data) {
					return AutoNumeric.format(data, {
						digitGroupSeparator: ",",
						decimalCharacter: ".",
						decimalPlaces: 0
					});
				}
				},
	        { data: "Doller.TransferAmount",
				render: function (data) {
					return AutoNumeric.format(data, {
						digitGroupSeparator: ",",
					})
				}
	        },
	        { data: "Doller.ServiceCharge" },
	        { data: "Bills"},
	    ],
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		layout: {
	        topEnd: {
	            buttons: [
					{	extend: "excel",
						text: "excel",
	                    buttons: ["excel"]
	                }
	            ]
	        }
	    },
	});

    /*searchDateInTable("#startDate", "#endDate", 11)*/

	$("#searchBtn").on("click", function() {
		searchTable(table, "#senderPartnerSelect", 10)

	    table.draw();
	})

	table.on('length.dt', function(e, settings, len) {
		$("#tablePageInput").val(len);
	});

	setTimeout(() => {
		const pageLength = $("#tablePageInput").val() || 50;
		table.page.len(pageLength);
	}, 0);
});