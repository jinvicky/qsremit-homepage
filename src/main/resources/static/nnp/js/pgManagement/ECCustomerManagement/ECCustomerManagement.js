$(document).ready(async function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');
    $("#reasonSelect").hide();
    $("#searchText").hide();

    $("#columnSelect").on("change", function () {
        handleColumnSelect()
    })

    handleColumnSelect();

    function handleColumnSelect() {
        const selected = $("#columnSelect").val();
        if (selected === "reason") {
            $("#reasonSelect").show();
            $("#bankNameSelectSearch").hide();
            $("#searchText").hide();
            $("#searchText").val("");
        } else if (selected === "bankName") {
            $("#bankNameSelectSearch").show();
            $("#reasonSelect").hide();
            $("#searchText").hide();
            $("#searchText").val("");
        } else  {
            $("#reasonSelect").hide();
            $("#bankNameSelectSearch").hide();
            $("#searchText").show();

            if (selected === "accountNo") {
                $('#searchText').attr('placeholder', 'Search by number');
            } else {
                $('#searchText').attr('placeholder', 'Search');
            }
        }
    }

    const reasonMap = {};
    await getBankAndReason(reasonMap);

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
    $("#reasonSelect").on("change", function () {
        $("#reasonInput").val($("#reasonSelect").val());
    })
    $("#columnSelect").on("change", function () {
        $("#searchText").val("");
    })

    /* ------- DataTable 초기화 -------- */
    const columns = [
        { title: "No.", data: "id", width: "5%", className: "dt-head-center dt-body-center" }, // 0
        { title: "Bank Name", data: "ecBankName" }, // 1
        { title: "Account Number", data: "ecAccountNo" }, // 2
        { title: "Holder name", data: "ecHolderName" }, // 3
        { title: "Reason", data: "ecReason" }, // 4
        { title: "Receiver", data: "ecReceiver" }, // 5
        { title: "Company Name", data: "ecCompanyName" }, // 6
        { title: "Status", data: "ecStatus"}, // 7
        { data: "createdAt", visible: false } // 8
    ];

    const EXPIRED = "rgb(251,164,164)"
    // Table 초기화
    const table = new DataTable("#ECCustomerManagementTable", {
        columns: columns,
        searching: true,
        order: [[7, "asc"], [8, "desc"]],
        serverSide: false,
        processing: true,
        paging: true,
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        ajax: {
            url: '/pgManagement/ECCustomerManagement/list',
            method: 'GET',
            dataSrc: function(data) {
                if (data.reasons) {
                    data.reasons.forEach(reason => {
                        reasonMap[reason.code] = reason.reason;
                    });
                }

                if (data.customers) {
                    data.customers.forEach(customer => {
                        customer.ecReason = reasonMap[customer.ecReason] || customer.ecReason;
                    });
                    return data.customers;
                }
                return [];
            }
        },
        autoWidth: true,
        rowId: "No.",
        layout: {
            topEnd: { }
        },
        columnDefs: [
            { }
        ],
        rowCallback: function(row, data, index) {
            // No
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);

            // Status
            if (data.ecStatus === "LOCKED") {
                $(row).find('td').css({"background-color": EXPIRED});
            }
        },
        initComplete: function () {
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        }
    });

    const fetchData = (status, searchType, searchText) => {
        if (searchType === "reason") {
            searchText = $("#reasonSelect").val();
        } else if (searchType === "bankName") {
            searchText = $("#bankNameSelectSearch").val();
        }

        $.ajax({
            url: '/pgManagement/ECCustomerManagement/search',
            type: 'GET',
            data: {
                status: status,
                searchType: searchType,
                searchValue: searchText
            },
            dataType: 'json',
            success: function (data) {
                data.forEach(item => {
                    item.ecReason = reasonMap[item.ecReason] || item.ecReason;
                });
                table.clear().rows.add(data).draw();
            },
            error: function (xhr, status, error) {
                console.log("Error Message:", error);
            }
        })
    }

    // 검색 버튼 클릭 이벤트
    $("#searchBtn").on("click", function() {
        const status = $("#statusSelect").val() === "" ? "" : $("#statusSelect").val();
        const searchType = $("#columnSelect").val();
        const searchText = $("#searchText").val();

        fetchData(status, searchType, searchText);
    });

    // Enter 키 이벤트
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#searchBtn").trigger("click");
        }
    });


    $('#ECCustomerManagementTable tbody').on('click', 'tr', function () {
        const rowData = table.row(this).data();
        if (!rowData) {
            return;
        }
        window.location.href = '/pgManagement/ECCustomerDetail?customerId=' + rowData.id;
    });

    table.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        table.page.len(pageLength);
    }, 0);
});