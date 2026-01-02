$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    $("#countryPartnerSelect").change(function () {
        const selectedValue = $(this).val();

        if (selectedValue === "Country") {
            $("#inboundCountrySelect").show();
            $("#payoutPartnerSelect").hide();
            $("#payoutPartnerSelect").val("");
        } else {
            $("#inboundCountrySelect").hide();
            $("#payoutPartnerSelect").show();
            $("#inboundCountrySelect").val("");
        }
    });

    const columns = [
        {
            data: "No",
            render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }
        },
        {data: "txnId"},
        {data: "beneficiaryName"},
        {data: "senderName"},
        {data: "senderCountry"},
        {data: "senderPartner"},
        {
            data: "receiveAmount",
            render: function (data) {
                return AutoNumeric.format(data, {
                    digitGroupSeparator: ",",
                    decimalCharacter: ".",
                    decimalPlaces: 0
                });
            }
        },
        {data: "bank"},
        {data: "branch"},
        {data: "accountNumber"},
        {data: "depositType"},
        {data: "depositMethod"},
        {data: "relation"},
        {data: "fundSource"},
        {data: "reason"},
        {
            data: "transactionDate",
            render: function (data) {
                return data ? moment(data).format('YYYY-MM-DD HH:mm') : '';
            }
        },
        {
            data: "endDate",
            render: function (data) {
                return data ? moment(data).format('YYYY-MM-DD HH:mm') : '';
            }
        },
        {data: "status"}
    ]

    /**
     * 전체 inbound 거래 내역을 조회합니다.
     */
    const table = new DataTable("#transaction-inbound-table", {
        data: [],
        serverSide: false,
        processing: true,
        paging: true,
        rowId: "no",
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        ajax: {
            url: '/transaction/transactionInboundHistory/',
            beforeSend: function(xhr) {
                xhr.setRequestHeader(header, token);
            },
            dataSrc: function (json) {
                console.log('✅ Ajax Result:', json);

                // 데이터 전처리
                return Array.isArray(json) ? json : [];
            }
        },
        columns: columns,
        layout: {
            topEnd: {
                buttons: [
                    {
                        text: 'Reload',
                        className: 'btn btn-soft-secondary',
                        action: function (e, dt, node, config) {
                            dt.ajax.reload();
                        }
                    },
                    {
                        extend: "excel",
                        text: "Export to Excel",
                        className: 'btn btn-soft-secondary',
                        title: null,
                        filename: function () {
                            const date = moment().format('YYMMDD');
                            const randomNumber = Math.floor(Math.random() * 10000);
                            return `inboundHistory_${date}_${randomNumber}`;
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
                    },
                ]
            }
        },
        initComplete: function () {
            $('.dt-button').removeClass('dt-button');

            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        }
    });


    table.on("click", "tbody tr", function () {
        const rowData = table.row(this).data();
        if (rowData && rowData.txnId) {
            window.location.href = `/transaction/transactionInboundHistoryDetail/${rowData.txnId}`;
        } else {
            console.error("Transaction ID not found for the clicked row.");
        }
    });

    $.fn.dataTable.ext.search.push(function (settings, data) {
        const txnDateType = $('#TXNDateSelect').val();
        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();

        const columnIndex = txnDateType === 'transactionDate' ? 15 : 16;
        const dateStr = data[columnIndex];

        if (!startDate && !endDate) return true;
        if (dateStr) {
            // 1. dateStr을 moment 객체로 변환 후, 'YYYY-MM-DD'까지만 포맷
            const formattedDate = moment(dateStr).format('YYYY-MM-DD');
            const date = moment(formattedDate, 'YYYY-MM-DD');

            if (startDate && date.isBefore(moment(startDate, 'YYYY-MM-DD'))) return false;
            if (endDate && date.isAfter(moment(endDate, 'YYYY-MM-DD'))) return false;
        }
        return true;
    });
    $('#search-btn').on('click', function () {
        // 1. 먼저 모든 column search 초기화
        table.columns().search('');
        table.search('');

        // 2. 상태 필터
        const status = $('#statusSelect').val();
        if (status) {
            table.column(17).search(status);
        }

        // 3. 컬럼(이름, 수령자, 트랜잭션ID) 필터
        const searchText = $('#searchText').val();
        const selectedColumn = $('#columnSelect').val();
        let columnIndex = -1;
        switch (selectedColumn) {
            case "Sender's Name":
                columnIndex = 3;
                break;
            case "Beneficiary's Name":
                columnIndex = 2;
                break;
            case "Transaction ID":
                columnIndex = 1;
                break;
        }
        if (columnIndex >= 0 && searchText) {
            table.column(columnIndex).search(searchText);
        }

        // 4. Deposit Type 필터
        const depositType = $('#depositTypeSelect').val();
        if (depositType) {
            table.column(10).search(depositType);
        }

        // 5. Deposit Method 필터

        const depositMethod = $('#depositMethodSelect').val();
        if (depositMethod) {
            table.column(11).search(depositMethod);
        }
        // 6. Country/Partner 필터
        const selectedType = $('#countryPartnerSelect').val();
        const country = $('#inboundCountrySelect').text().trim();
        const partner = $('#payoutPartnerSelect').text().trim();

        if (selectedType === 'Country' && country) {
            table.column(4).search(country);
            table.column(5).search('');
        } else if (selectedType === 'Partner' && partner) {
            table.column(5).search(partner);
            table.column(4).search('');
        } else {
            table.column(4).search('');
            table.column(5).search('');
        }

        table.draw();
    });
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#search-btn").trigger("click");
        }
    });

    table.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        table.page.len(pageLength);
    }, 0);
});