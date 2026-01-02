$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content')

    const today = new Date();
    const todayFormat = moment().format('YYYY-MM-DD');
    const todayTime = moment().format('HH:mm');
    const formattedDate = today.toISOString().split('T')[0]
    let bankType = null;

    // 데이터 불러오기
    function fetchLogData(startDate, endDate, type, keyword, status, bank) {
        $.ajax({
            url: "/bankDepositHistory/", // 변경
            type: "GET",
            data: {
                type: type,
                keyword: keyword,
                startDate: startDate,
                endDate: endDate,
                status: status,
                bank: bank,
            },
            success: function (data) {
                table.clear();
                table.rows.add(data.history);
                table.draw();

                $("#startDate").datepicker('update', startDate);
                $("#endDate").datepicker('update', endDate);
                if (type === '' || type === null) {
                    $("#columnsSelect").val($("#columnsSelect option").eq(0).val());
                } else {
                    $("#columnsSelect").val(type);
                }
                $("#searchText").val(keyword);
                $("#statusSelect").val(status);

                fillSummaryRowsFromTotalData(data.total);

                const period = endDate === todayFormat ? `(${startDate} 00:00 ~ ${endDate} ${todayTime})`: `(${startDate} 00:00 ~ ${endDate} 23:59)`;
                $("#summary").text(`Summary ${period}`);
            },
            error: function (xhr, error) {
                console.error("Error:", error);
                alert("An error occurred while fetching the data.");
            }
        })
    }
    window.fetchLogData = fetchLogData;

    // Editor
    const editor = new DataTable.Editor({
        ajax: {
            edit: {
                type: 'PUT',
                url: `/bankDepositHistory/update/{id}`,
                contentType: 'application/json',
                data: function (data) {
                    const updateData = Object.values(data.data)[0];
                    return JSON.stringify({
                        memo: updateData.memo
                    });
                },
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(header, token);
                },
                success: function () {
                    const startDate = $("#startDate").val();
                    const endDate = $("#endDate").val();
                    const type = $("#columnsSelect").val();
                    const keyword = $("#searchText").val();
                    const status = $("#statusSelect").val();

                    fetchLogData(startDate, endDate, type, keyword, status, bankType);
                },
                error: function (xhr, status, error) {
                    console.error("Error Message:", error);
                }
            },
        },
        idSrc: "id",
        fields: [
            {label: "Memo", name: "memo"}
        ],
        table: "#bankDepositTable"
    });

    editor.on('preSubmit', function (e, o, action) {
        const memo = this.field('memo');
        memo.error("")

        if (action !== 'remove') {
            if (isHtml(memo.val())) {
                memo.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
            }

            if (this.inError()) {
                return false;
            }
        }
    })

    // Table
    const table = new DataTable("#bankDepositTable", {
        dom: 'lrtip',
        lengthMenu: [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
        ],
        rowId: "id",
        columns: [
            { data: null, orderable: false, render: DataTable.render.select() },
            {title: "No.", data: null, width: "3%"},
            {data: "bank", title: "Bank"},
            {
                data: "depositDate",
                title: "Deposit Date",
                width: "12%",
                orderable: true,
                defaultContent: "",
                render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD') : '';
                }
            },
            {
                data: "refundDate",
                title: "Refund Date",
                orderable: true,
                defaultContent: "",
                render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD') : '';
                }
            },
            {data: "accountHolder", title: "Account Holder"},
            {
                data: "depositAmount", title: "Deposit Amount",
                width: "5%",
                render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalPlaces: 0
                    });
                }
            },
            {
                data: "transactionIds", title: "Transaction ID",
                render: function (data, type, row) {
                    if (row.status === "PENDING" || row.status === "GO_TO_APPROVE") {
                        return "<input type='text' placeholder='e.g) QP1756885508885991' class='input-transaction'>";
                    } else if (data && data.length > 0 && data[0]!=null ) {
                        return data.map(transactionId =>
                            `<a href="/transaction/transactionOutboundHistoryDetail/${transactionId}">${transactionId}</a>`
                        ).join("\n");
                    } else {
                        return "";
                    }
                },
            },
            {
                data: "customerId", title: "Customer ID",
                width: "10%",
                className: "editable",
                render: function (data, type, row) {
                    if (row.status === "PENDING" || row.status === "GO_TO_APPROVE") {
                        return "<input type='text' placeholder='e.g) C00001234' class='input-customer'>";
                    } else if (!data || data === "") {
                        return "";
                    } else {
                        return `<a href='/customer/customerDetail/${data}/${row.customerType}'>${data}</a>`;
                    }
                }
            },
            {data: "memo", name: "memo", className: "editable-memo", title: "Memo"},
            {data: "status", title: "Status"},
            {
                data: null,
                title: "Action",
                orderable: false,
                render: function (data, type, row) {
                    if (row.status === "PENDING" || row.status === "GO_TO_APPROVE") {
                        return '<button class=\'fApprove-button btn btn-warning btn-xs\' style="width: 80px; margin-bottom: 5px;">Fapprove</button>' +
                        '<button class=\'diable-button btn btn-dark btn-xs\' style="width: 80px; margin-bottom: 5px;">Disable</button><br>' +
                            '<button class=\'refund-button btn btn-danger btn-xs\' style="width: 80px;">Refund</button>';
                    } else if (row.status === "APPROVED" || row.status === "F_APPROVE") {
                        return '<button class=\'refund-button btn btn-danger btn-xs\' style="width: 80px">Refund</button>';
                    } else {
                        return '';
                    }
                }
            },
            {data: "customerType", title: "", visible: false},
        ],
        columnDefs: [
            { targets: [1, 3, 4], className: "dt-head-center dt-body-center" }
        ],
        searching: false,
        filter: false,
        select: {
            style: 'multi',
            selector: 'td:first-child'
        },
        rowCallback: function (row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(1)', row).html(reverseIndex);

            if (data.status === "APPROVED" || data.status === "F_APPROVE") {
                $(row).css("background-color", "#ffecb9"); // 노란색
            } else if (data.status === "AGENT_DEPOSIT") {
                $(row).css("background-color", "#d3d3d3");
            } else if (data.status === "REFUND") {
                $(row).css("background-color", "#fba4a4");
            } else {
                $(row).css("background-color", ""); // 기본
            }
        },
        initComplete: function () {
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        }
    });

    table.on('click', 'tbody td', function () {
        try {
            editor.inline(this);
        } catch (error) {
            console.error(
                "Error: ",
                error)
        }
    });
    $("#DeleteButton").on("click", function () {
        deleteData();
    })

    // Summary 테이블 데이터 매핑 함수
    function fillSummaryRowsFromTotalData(data) {
        const rows = document.querySelectorAll('#customerTypeSummary tr');
        let total = 0;
        let count = 0;

        rows.forEach(row => {
            const cells = row.getElementsByTagName('td');
            if (cells.length >= 3) {
                const bankName = cells[0].textContent.trim();

                const matched = data.find(item => item.bank === bankName);

                const totalCount = matched ? matched.totalCount : 0;
                const totalAmount = matched ? matched.totalAmount : 0;

                cells[1].textContent = totalCount;
                cells[2].textContent = AutoNumeric.format(totalAmount, {
                    digitGroupSeparator: ",",
                    decimalCharacter: ".",
                    decimalPlaces: 0
                });

                total+=totalAmount;
                count+=totalCount;
            }
        });

        $("#data-total td:eq(1) b").text(`${count}`);
        $("#data-total td:eq(2) b").text(AutoNumeric.format(total, {
            digitGroupSeparator: ",",
            decimalCharacter: ".",
            decimalPlaces: 0
        }));
    }

    // Disable 버튼
    table.on("click", ".diable-button", function (event) {
        event.stopPropagation();
        event.preventDefault();

        const row = table.row($(this).closest("tr"));
        const rowData = row.data();

        if (!rowData) return;

        if (confirm("Are you sure you want to Disable this deposit?\n\nIf you proceed, the deposit status will be changed to 'Agent Deposit'.")) {
            $.ajax({
                url: `/bankDepositHistory/disable/${rowData.id}`,
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                success: function () {
                    const startDate = $("#startDate").val();
                    const endDate = $("#endDate").val();
                    const type = $("#columnsSelect").val();
                    const keyword = $("#searchText").val();
                    const status = $("#statusSelect").val();

                    fetchLogData(startDate, endDate, type, keyword, status, bankType);
                },
                error: function (xhr, status, error) {
                    console.error("Error:", error); // 에러 로그 출력
                    alert("Disable Failed. Please try again later.");
                }
            });
        }
    })

    // fapprove 버튼
    table.on("click", ".fApprove-button", function (event) {
        event.stopPropagation();
        event.preventDefault();

        const row = table.row($(this).closest("tr"));
        const rowData = row.data();
        const rowNode = $(row.node());

        if (!rowData) return;

        const transactionId = rowNode.find(".input-transaction").val();

        if (!transactionId) {
            alert("Transaction ID is required.");
            return;
        }

        const transactions = transactionId.match(/QP\d{16}/g) || []; // 정규식에 매칭되지 않으면 빈 배열 반환

        if (confirm("Are you sure you want to Fapprove this deposit?")) {
            $.ajax({
                url: `/bankDepositHistory/fapprove/${rowData.id}`,
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                contentType: "application/json",
                data: JSON.stringify({
                    transactionID: transactions
                }),
                success: function () {
                    const startDate = $("#startDate").val();
                    const endDate = $("#endDate").val();
                    const type = $("#columnsSelect").val();
                    const keyword = $("#searchText").val();
                    const status = $("#statusSelect").val();

                    fetchLogData(startDate, endDate, type, keyword, status, bankType);
                },
                error: function (xhr, status, error) {
                    console.error("Error:", error); // 에러 로그 출력
                    alert("Fapprove Failed. Please try again later.");
                }
            });
        }
    })

    // Refund 버튼
    table.on("click", ".refund-button", function (event) {
        event.stopPropagation();
        event.preventDefault();

        const row = table.row($(this).closest("tr"));
        const rowData = row.data();

        const customerId = rowData.customerId || null;
        const rowNode = $(row.node());
        const customerIdVal = rowNode.find(".input-customer").val() || null;

        if (!rowData) return;
        if (!customerId && !customerIdVal) {
            alert("Customer ID is required.");
            return;
        }

        if (confirm("Are you sure you want to Refund this deposit?")) {
            const validCustomerId = customerId || customerIdVal.trim();
            $.ajax({
                url: `/bankDepositHistory/refund/${rowData.id}`,
                type: "POST",
                xhrFields: { withCredentials: true },
                contentType: "application/json",
                data: JSON.stringify({
                    customerId: validCustomerId,
                }),
                success: function () {
                    const startDate = $("#startDate").val();
                    const endDate = $("#endDate").val();
                    const type = $("#columnsSelect").val();
                    const keyword = $("#searchText").val();
                    const status = $("#statusSelect").val();

                    fetchLogData(startDate, endDate, type, keyword, status, bankType);
                },
                error: function (xhr, status, error) {
                    console.error("Error:", error); // 에러 로그 출력
                    alert("Refund Failed. Please try again later.");
                }
            });
        }
    })

    function deleteData() {
        const selectedIds = table.rows({ selected: true }).data().toArray().map(row => row.id);

        if (selectedIds.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }

        $.ajax({
            method: 'DELETE',
            url: `/bankDepositHistory/delete`,
            contentType: 'application/json',
            data: JSON.stringify({
                ids: selectedIds
            }),
            success: function () {
                alert("Bank Deposit delete successfully.")
                const startDate = $("#startDate").val();
                const endDate = $("#endDate").val();
                const type = $("#columnsSelect").val();
                const keyword = $("#searchText").val();
                const status = $("#statusSelect").val();

                fetchLogData(startDate, endDate, type, keyword, status, bankType);
            },
            error: function (xhr, status, error) {
                console.error("Error Message:", error);
                alert("Error occurred while deleting data. Please try again.");
            }
        });
    }
});