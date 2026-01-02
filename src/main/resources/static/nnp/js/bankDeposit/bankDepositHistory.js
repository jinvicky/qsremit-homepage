$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content')

    const today = new Date();
    const todayFormat = moment().format('YYYY-MM-DD');
    const todayTime = moment().format('HH:mm');
    const formattedDate = today.toISOString().split('T')[0]

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

    $("#columnsSelect").on("change", function () {
        if ($("#columnsSelect").val() == 1) {
            $("#bankSelect").show();
            $("#searchText").hide();
            $("#searchText").val("");
        } else {
            $("#bankSelect").hide();
            $("#searchText").show();
        }
    })

    $.ajax({
        url: `/bankDeposit/bankTypeManagement/banks`,
        type: "GET",
        success: function (response) {
            $("#bankSelect").empty();

            // <select> 옵션 추가
            let options = '<option value="">Select</option>';
            response.forEach(function (item) {
                if(item.bank !== "CASH") {
                    options += `<option ${$("#bankSelectInput").val() == item.bank ? 'selected' : ''} value="${item.bank}">${item.bank}</option>`;
                }
            });
            $("#bankSelect").html(options);

            // Editor 필드 업데이트
            const editorOptions = response
                .filter(item => item.bank !== "CASH") // CASH 제외
                .map(item => {
                    return { label: item.bank, value: item.bank };
                });
            depositNewEditor.field("bank").update(editorOptions);

            getSummaryTable(response);
        },
        error: function (xhr, status, error) {
            console.error("Error loading options:", error);
        }
    });

    fetchLogData(formattedDate, formattedDate, null, null, null, null);

    $("#search-btn").on("click", function () {
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();
        const type = $("#columnsSelect").val();

        const keyword = ($("#searchText").is(":visible"))
            ? $("#searchText").val()
            : $("#bankSelect").val();

        const status = $("#statusSelect").val();

        fetchLogData(startDate, endDate, type, keyword, status, null);
    })
    $(document).on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#search-btn").trigger("click");
        }
    });

    // New Bank Deposit 버튼 리스너
    document.getElementById("createDeposit").addEventListener("click", function () {
        depositNewEditor.create({
            title: "New Bank Deposit",
            buttons: "Save"
        }).open();
    });

    // Bank Deposit 생성용 editor
    const depositNewEditor = new DataTable.Editor({
        table: "#bankDepositTable",
        idSrc: "id",
        fields: [
            {
                label: "Deposit Bank <span style=\"color: red;\">*</span>",
                name: "bank",
                type: "select", // 필드 타입을 select로 설정
                options: [ ],
                def: "UFJ_BANK" // 기본값 설정
            },
            {label: "Account Holder <span style=\"color: red;\">*</span>", name: "accountHolder"},
            {label: "Deposit Amount <span style=\"color: red;\">*</span>", name: "depositAmount"},
            {
                label: "Deposit Date <span style=\"color: red;\">*</span>",
                name: "depositDate",
                type: "datetime",
                format: "YYYY-MM-DD",
                def: function () {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0'); // 1월은 0이므로 +1
                    const day = String(today.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                },
                opts: {
                    maxDate: new Date(),
                }
            },
        ],
        ajax: {
            create: {
                type: "POST",
                url: "/bankDepositHistory/new",
                contentType: "application/json",
                data: function (data) {
                    const depositData = Object.values(data.data)[0];

                    return JSON.stringify(validateData(depositData));
                },
                success: function (response) {
                    alert(response.message);
                    depositNewEditor.close();
                    window.location.reload();
                },
                error: function (response) {
                    alert(response.message);
                }
            },
        }
    })

    depositNewEditor.on('preSubmit', function (e, o, action) {
        const amount = this.field('depositAmount');
        const depositDate = this.field('depositDate');
        const holder = this.field('accountHolder');

        amount.error('');
        depositDate.error('');
        holder.error('');

        if (action === 'create' || action === 'edit') {
            const amountVal = amount.val();
            const depositDateVal = depositDate.val();
            const holderVal = holder.val();
            if (depositDateVal) {
                const depositDateObj = moment(depositDateVal, moment.ISO_8601, true);
                if (!depositDateObj.isValid()) {
                    depositDate.error('Invalid deposit date format.');
                }
            } else {
                depositDate.error('Deposit date is required.');
            }

            if (!holderVal) {
                holder.error('Account Holder is required.');
            }

            if (amountVal) {
                if (!amountVal.replace(/,/g, '').match(/^[0-9]+$/)) {
                    amount.error('Only numeric values are allowed for Deposit Amount.');
                }
            } else {
                amount.error('Deposit Amount is required.');
            }
        }
        if (action !== 'remove') {
            if (this.inError()) {
                return false;
            }
        }
    });

    function validateData(data) {
        if (data.depositDate !== null) {
            data.depositDate = moment(data.depositDate, moment.ISO_8601, true).format("YYYY-MM-DD");
        }
        if (data.depositAmount !== null) {
            data.depositAmount = data.depositAmount.replace(/\D/g, '');
        }
        return data;
    }

    // ================================== Summary 테이블
    // Summary 테이블 구성 함수
    function getSummaryTable(options) {
        const customerTypeSummary = document.getElementById('customerTypeSummary');
        customerTypeSummary.textContent = '';

        const toIdSafe = (v) => `data-${String(v).trim().replace(/[^\w-]/g, '_')}`;

        options.forEach(type => {
            const row = document.createElement('tr');
            row.id = toIdSafe(type.bank);
            row.classList.add('bg-light');

            const td1 = document.createElement('td');
            td1.textContent = type.bank;

            const td2 = document.createElement('td');

            const td3 = document.createElement('td');
            td3.classList.add('text-end');

            row.append(td1, td2, td3);
            customerTypeSummary.appendChild(row);
        });
    }
    // =====================================================

    // ================================== modal
    // 모달 Table 초기화
    const customerTypeTable = new DataTable("#accountDepositCustomerTypeTable", {
        dom: 'lrtip',
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        rowId: "id",
        columns: [
            {title: "No.", data: null, width: "3%"}, // 0
            {data: "bank", title: "Bank"},
            {
                data: "depositDate",
                title: "Deposit Date",
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
                    if (!data || data.length === 0) {
                        return "";
                    } else {
                        return data.map(transactionId =>
                            `<a>${transactionId || ""}</a>`
                        ).join("\n");
                    }
                }
            },
            {
                data: "customerId", title: "Customer ID",
                className: "editable",
                render: function (data, type, row) {
                    if (!data || data === "") {
                        return "";
                    } else {
                        return `<a>${data}</a>`;
                    }
                }
            },
            {data: "memo", name: "memo", className: "editable-memo", title: "Memo"},
            {data: "status", title: "Status"},
        ],
        columnDefs: [
            { targets: [0, 2, 3], className: "dt-head-center dt-body-center" }
        ],
        searching: false,
        filter: false,
        rowCallback: function (row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);

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

    // 모달 테이블 데이터 fetch
    const fetchModalData = (startDate, endDate, type, keyword, status, bank) => {
        $.ajax({
            url: "/bankDepositHistory/", // 변경
            type: "GET",
            data: {
                startDate: startDate,
                endDate: endDate,
                type: type,
                keyword: keyword,
                status: status,
                bank: bank
            },
            success: function (data) {
                const tableData = data.history;
                customerTypeTable.clear();
                customerTypeTable.rows.add(tableData);
                customerTypeTable.draw();

                const period = endDate === todayFormat ? `(${startDate} 00:00 ~ ${endDate} ${todayTime})`: `(${startDate} 00:00 ~ ${endDate} 23:59)`;
                $("#modalTitle").text(`${bank} ${period}`);
            },
            error: function (xhr, error) {
                console.error("Error:", error);
                alert("An error occurred while fetching the data.");
            }
        })
    }

    // customer type 별 Deposit 목록 모달창 오픈
    $(document).on('click', '#customerTypeSummary [id^="data-"]', function (e) {
        e.preventDefault();

        const elementId = this.id;
        const bank = elementId.split("data-")[1];
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();
        const type = $("#columnsSelect").val();
        const keyword = ($("#searchText").is(":visible"))
            ? $("#searchText").val()
            : $("#bankSelect").val();
        const status = $("#statusSelect").val();

        $('#bankDepositHistoryModal').modal('show');

        fetchModalData(startDate, endDate, type, keyword, status, bank);
    });
    // =====================================================

    $("#bankDepositTable").on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        $("#bankDepositTable").DataTable().page.len(pageLength);
    }, 0);
});