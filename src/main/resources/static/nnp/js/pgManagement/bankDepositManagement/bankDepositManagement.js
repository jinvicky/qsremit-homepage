$(document).ready(async function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');
    $("#searchText").hide();

    $("#columnSelect").on("change", function () {
        handleColumnSelect()
    })

    await getBankAndReason();
    handleColumnSelect();

    function handleColumnSelect() {
        const selected = $("#columnSelect").val();
        if (selected === "bankName") {
            $("#bankNameSelectSearch").show();
            $("#searchText").hide();
            $("#searchText").val("");
        } else {
            $("#bankNameSelectSearch").hide();
            $("#searchText").show();

            const placeholderMap = {
                accountNo: "Search by number",
                amount: "Amount should be equal",
            };

            $("#searchText").attr("placeholder", placeholderMap[selected] || "Search");
        }
    }

    // ajax 초기화
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json"
        },
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    $("#bankNameSelectSearch").on("change", function () {
        $("#bankNameInput").val($("#bankNameSelectSearch").val());
    })
    $("#columnSelect").on("change", function () {
        $("#searchText").val("");
    })

    /* ------- DataTable 초기화 -------- */
    const columns = [
        { title: "No.", data: null, width: "5%", className: "dt-head-center dt-body-center" }, // 0
        { title: "Date", data: "depositDate",
            width: "12%", className: "dt-head-center dt-body-center",
            render: function (data) {
                return data ? moment(data).format('YYYY-MM-DD') : '';
            }}, // 1
        { title: "Bank Name", data: "bankName" }, // 2
        { title: "Account Number", data: "accountNo" }, // 3
        { title: "Receiver", data: "receiver" }, // 4
        { title: "Amount", data: "amount", render: function (data) {
                return AutoNumeric.format(data, {
                    digitGroupSeparator: ",",
                    decimalCharacter: ".",
                    decimalPlaces: 0
                });
            }}, // 5
        { title: "Reference", data: "reference" }, // 6
        { title: "Status", data: "status" }, // 7
        { title: "Memo", data: "memo" }, // 8
        {
            title: "Approve",
            data: null,
            orderable: false,
            render: function(data, type, row, meta) {
                if (row.status === "PENDING") {
                    return "<button class='refund-button btn btn-danger btn-xs'>Approve</button>";
                } else {
                    return '';
                }
            }
        }, // 9
        {
            title: "Cancel",
            data: null,
            orderable: false,
            render: function(data, type, row, meta) {
                if (row.status === "PENDING") {
                    return "<button class='cancel-button btn btn-dark btn-xs'>Cancel</button>";
                } else {
                    return '';
                }
            }
        }, // 10
        { data: "id", visible: false }, // 11
    ];

    let rowNum = 1;

    // Table 초기화
    const table = new DataTable("#bankDepositManagementTable", {
        columns: columns,
        searching: false,
        order: [[1, "desc"]],
        serverSide: false,
        processing: true,
        paging: true,
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        autoWidth: true,
        rowId: "No.",
        layout: {
            topEnd: {
                buttons: [
                    {
                        extend: "excel",
                        text: "Export to Excel",
                        className: 'btn btn-soft-secondary',
                        title: null,
                        filename: function () {
                            const date = moment().format('YYMMDD');
                            const randomNumber = Math.floor(Math.random() * 10000);
                            return `bankDeposit_${date}_${randomNumber}`;
                        },
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                            format: {
                                body: function (data, row, column) {
                                    if (column === 0) {
                                        return rowNum++;
                                    }
                                    return data;
                                }
                            }
                        },
                        customize: function () {
                            rowNum = 1;
                        }
                    }
                ]
            }
        },
        initComplete: function () {
            $('.dt-button').removeClass('dt-button');
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        },
        columnDefs: [
            {
                targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                createdCell: function (td, cellData, rowData) {
                    if (rowData.status === "CANCELLED") {
                        $(td).css('background-color', 'rgba(114,114,114,0.3)');
                    }
                }
            }
        ],
        rowCallback: function(row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);
        }
    });

    const formattedDate = moment().format('YYYY-MM-DD');

    const fetchData = (startDate, endDate, status, searchType, searchText) => {
        if (searchType === "bankName") {
            searchText = $("#bankNameSelectSearch").val();
        }

        $.ajax({
            url: '/pgManagement/bankDepositManagement/search',
            type: 'GET',
            data: {
                startDate: startDate,
                endDate: endDate,
                status: status,
                searchType: searchType,
                searchValue: searchText
            },
            dataType: 'json',
            success: function (data) {
                table.clear().rows.add(data).draw();
            },
            error: function (xhr, status, error) {
                console.log("Error Message:", error);
            }
        })
    }

    fetchData(formattedDate, formattedDate);

    // 검색 버튼 클릭 이벤트
    $("#searchBtn").on("click", function () {
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();
        const status = $("#statusSelect").val() === "" ? undefined : $("#statusSelect").val();
        const searchType = $("#columnSelect").val();
        const searchText = $("#searchText").val();

        fetchData(startDate, endDate, status, searchType, searchText);
    });

    // Enter 키 이벤트
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#searchBtn").trigger("click");
        }
    });

    table.on('click', 'tbody tr', function () {
        const rowData = table.row(this).data();
        if (!rowData) {
            return;
        }
        window.location.href = '/pgManagement/bankDepositDetail?depositId=' + rowData.id;
    });

    // Approve btn
    table.on("click", ".refund-button", function (event) {
        event.stopPropagation();
        event.preventDefault();

        const row = table.row($(this).closest("tr"));
        const rowData = row.data();

        if (!rowData) return;

        if (confirm("Are you sure you want to APPROVE this deposit?")) {
            $.ajax({
                url: `/pgManagement/bankDepositManagement/approve/${rowData.id}`,
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                success: function () {
                    $("#searchBtn").trigger("click");
                },
                error: function (xhr, status, error) {
                    console.error("Error:", error); // 에러 로그 출력
                    alert("Approve Failed. Please try again later.");
                }
            });
        }
    })

    // Cancel btn
    table.on("click", ".cancel-button", function (event) {
        event.stopPropagation();
        event.preventDefault();

        const row = table.row($(this).closest("tr"));
        const rowData = row.data();

        if (!rowData) return;

        if (confirm("Are you sure you want to CANCEL this deposit?")) {
            const reason = prompt("Please enter the reason why you want to cancel this deposit.");

            if (reason !== null) {
                $.ajax({
                    url: `/pgManagement/bankDepositManagement/cancel/${rowData.id}`,
                    method: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({
                        memo: reason
                    }),
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function(xhr){
                        xhr.setRequestHeader(header, token);
                    },
                    success: function (){
                        $("#searchBtn").trigger("click");
                    },
                    error: function (xhr, status, error) {
                        console.log("Error Message:", error);
                    }
                })
            }
        }
    })

    table.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        table.page.len(pageLength);
    }, 0);
});