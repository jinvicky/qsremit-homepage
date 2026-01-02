$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content')

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json"
        },
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader(header, token);
        }
    })

    $.ajax({
        url: `/payoutPartner/`,
        type: "GET",
        success: function (response) {
            $("#payoutPartnerSelect").empty();

            // <select> 옵션 추가
            let options = '<option value="">Select</option>';
            response.forEach(function (item) {
                options += `<option ${$("#bankSelectInput").val() == item.payoutPartner ? 'selected' : ''} value="${item.payoutPartner}">${item.payoutPartner}</option>`;
            });
            $("#payoutPartnerSelect").html(options);
        },
        error: function (xhr, status, error) {
            console.error("Error loading options:", error);
        }
    });

    const table = new DataTable("#settlementOutboundTable", {
        columns: [
            {
                data: null,
                title: "No.",
            },
            {
                data: "transactionNumber", title: "Transaction ID",
                render: function (data) {
                    return `<a href="/transaction/transactionOutboundHistoryDetail/${data}">${data}</a>`;
                }
            },
            {
                data: "payoutPartner", title: "Payout Partner",
            },
            {
                data: "collectedAmount", title: "Collected Amount",
                render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                }
            },
            {
                data: "transferAmount", title: "Transfer Amount",
                render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                }
            },
            {data: "serviceCharge", title: "Service Charge"},
            {
                data: "rateCollectedAmount", title: "Rate Collected Amount",
                render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                }
            },
            {
                data: "rateTransferAmount", title: "Rate Transfer Amount",
                render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                }
            },
            {data: "rateServiceCharge", title: "Rate Service Charge"},
            {
                data: "amountToPaid", title: "Amount To Paid",
                render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                }
            },
            {data: "currency", title: "Currency"},
        ],
        rowId: "id",
        layout: {
            topEnd: {
                buttons: [
                    {
                        extend: "excel",
                        className: 'btn btn-soft-secondary',
                        text: "Export to Excel",
                        title: null,
                        filename: function () {
                            const date = moment().format('YYMMDD');
                            const randomNumber = Math.floor(Math.random() * 10000);
                            return `outBoundSettlementReport_${date}_${randomNumber}`;
                        },
                        exportOptions: {
                            format: {
                                body: function (data, row, column, node) {
                                    if (column === 0) {
                                        return row + 1;
                                    }
                                    return data;
                                }
                            }
                        }
                    }
                ]
            }
        },
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        rowCallback: function (row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);
        },
        initComplete: function () {
            $('.dt-button').removeClass('dt-button');

            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        }
    });

    $("#searchBtn").on("click", function () {
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();
        const partner = $("#payoutPartnerSelect").val();

        fetchLogData(startDate, endDate, partner);
    })
    $(document).on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#searchBtn").trigger("click");
        }
    });

    const fetchLogData = function (startDate, endDate, partner) {
        $.ajax({
            url: "/transaction/outboundSettlementReport/",
            method: "GET",
            data: {
                startDate: startDate,
                endDate: endDate,
                payoutPartner: partner,
            },
            success: function (data) {
                table.clear();
                table.rows.add(data);
                table.draw();
            },
            error: function (xhr, error, thrown) {
                console.error("Error:", error);
                alert("An error occurred while fetching the data.");
            }
        })
    }

    fetchLogData(formattedDate, formattedDate, "");

    table.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        table.page.len(pageLength);
    }, 0);
});