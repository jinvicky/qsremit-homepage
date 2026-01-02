$(document).ready(async function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    /**
     * ajax 초기화
     */
    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    });

    let yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    $("#depositDate, #startDate, #endDate").datepicker({
        endDate: yesterday,
    })
    $("#depositDate").val(yesterday);
    $("#startDate").val(yesterday);
    $("#endDate").val(yesterday);

    /**
     * Summary Title
     * 공통으로 사용되는 날짜 재선언
     */
    let date, startDate, endDate, period;
    const getDateAndTime = () => {
        date = $("#depositDate").val();
        startDate = $("#startDate").val();
        endDate = $("#endDate").val();
        period = $("#rangeSearch").prop('checked') ? `Summary : ${startDate} ~ ${endDate}` : `Summary : ${date}`;
        $("#dateTitle").text(`${period}`);
    }
    getDateAndTime();

    /**
     * Search Field
     */
    let isChecked;
    const showRange = () => {
        isChecked = $("#rangeSearch").prop('checked');
        if (isChecked) {
            $("#singleDate").hide();
            $("#rangeDate").show();
        } else {
            $("#rangeDate").hide();
            $("#singleDate").show();
        }
        getDateAndTime();
    }
    showRange();

    $("#rangeSearch").on("change", function () {
        showRange();
        onSearchDate();
        table.ajax.reload();
    })

    if (!$('#startDateInput').val() || !$('#endDateInput').val()) {
        if ($('#rangeSearch').is(':checked')) {
            $('#startDateInput').val($("#startDate").val());
            $('#endDateInput').val($("#endDate").val());
        } else {
            const depositDate = $("#depositDate").val();
            $('#startDateInput').val(depositDate);
            $('#endDateInput').val(depositDate);
        }
    } else {
        $("#depositDate").val($('#endDateInput').val());
        $('#startDate').val($('#startDateInput').val());
        $('#endDate').val($('#endDateInput').val());
    }

    // 날짜 선택
    $("#depositDate").on("change", function () {
        const depositDate = $("#depositDate").val()
        $('#startDateInput').val(depositDate);
        $('#endDateInput').val(depositDate);
        table.ajax.reload();
    })
    $("#startDate, #endDate").on("change", function () {
        $('#startDateInput').val($("#startDate").val());
        $('#endDateInput').val($("#endDate").val());
        table.ajax.reload();
    })
    $(".searchCustomerType").on("change", function () {
        table.ajax.reload();
    })

    const onSearchDate = () => {
        if (isChecked) {
            $('#startDateInput').val($("#startDate").val());
            $('#endDateInput').val($("#endDate").val());
        } else {
            const depositDate = $("#depositDate").val()
            $('#startDateInput').val(depositDate);
            $('#endDateInput').val(depositDate);
        }
    }

    /**
     * Summary Table Editor Column Index
     */
    const COUNTS = 5;
    const TOTAL_AMOUNT = 6;
    const FEE_RATE = 7;
    const FEE_JPY = 8;
    const TOTAL_REFUND_AMOUNT = 9;
    const TOTAL_PAYMENT_AMOUNT = 10;
    const EXCHANGE_RATE = 11;
    const SETTLEMENT_AMOUNT = 12;
    const DEPOSIT_DATE = 13;
    const NEW_BANK_DEPOSIT = 14;
    const ORDER_NO = 16;

    /**
     * Summary Table
     */
    let isAdmin = false;
    async function initializeTable() {
        // 권한 체크 수행
        try {
            const response = await $.ajax({
                url: "/user/api/userRole",
                method: "GET"
            });
            isAdmin = response === "[ROLE_SUPER_ADMIN]" || response === "[ROLE_ADMIN]";
        } catch (error) {
            console.error("Cannot get user role:", error);
        }

        // 환불 테이블 공개 여부
        isAdmin ? $('#refund-body').show() : $('#refund-body').hide();

        return new DataTable("#dailySummaryTable", {
            autoWidth: false,
            ajax: function (data, callback) {
                fetchRangeData(data, callback)
            },
            columns: [
                { title: "No.", data: null, width: "4%", orderable: false, className: 'dt-center' }, // 0
                {
                    title: "Date",
                    data: "createdAt",
                    render: function (data) {
                        return data ? moment(data).format('YYYY-MM-DD') : '-';
                    }, className: "dt-head-center dt-body-center"
                }, // 1
                { title: "Customer", data: "customerType", orderable: false }, // 2
                {
                    title: `Company /\ Holder Name`,
                    data: "ecCompanyName",
                    orderable: false,
                    render: function (data, type, rowData) {
                        return (
                            rowData.ecCompanyName && rowData.ecCompanyName.trim() !== "" ? (
                                `<p class="m-0">${rowData.ecCompanyName} / ${rowData.ecHolderName}</p>`
                            ) : ""
                        )
                    }}, // 3
                {
                    title: `Bank /\ Account Number`,
                    data: "ecBankName",
                    orderable: false,
                    render: function (data, type, rowData) {
                        console.log(rowData)
                        return (
                            rowData.ecBankName && rowData.ecBankName.trim() !== "" ? (
                                `<p class="m-0">${rowData.ecBankName} / ${rowData.ecAccountNo}</p>`
                            ) : ""
                        )
                    }}, // 4
                { title: "Count", data: "counts", width: "6%" }, // 5
                {
                    title: "Total Amount (JPY)",
                    data: "totalAmount",
                    width: "7%", render: function (data) {
                        return AutoNumeric.format(data, {
                            digitGroupSeparator: ",",
                            decimalCharacter: ".",
                            decimalPlaces: 0
                        });
                    },
                }, // 6
                {
                    title: "Fee\ Rate (%)",
                    data: "feeRate",
                    width: "6%",
                    visible: isAdmin,
                    render: function (data) {
                        return data * 100;
                    }
                }, // 7
                {
                    title: "Fee\ (JPY)",
                    data: "feeJPY",
                    render: function (data) {
                        return AutoNumeric.format(data, {
                            digitGroupSeparator: ",",
                            decimalCharacter: ".",
                            decimalPlaces: 0
                        });
                    }
                }, // 8, 자동 계산
                {
                    title: "Total\ Refund\ Amount (JPY)",
                    data: "totalRefundAmount",
                    width: "7%",
                    render: function (data) {
                        return AutoNumeric.format(data, {
                            digitGroupSeparator: ",",
                            decimalCharacter: ".",
                            decimalPlaces: 0
                        });
                    }, className: "dt-head-right dt-body-rights"
                }, // 9, 자동 계산
                {
                    title: "Total\ Payment\ Amount (JPY)",
                    data: "totalPaymentAmount",
                    width: "7%",
                    render: function (data) {
                        return AutoNumeric.format(data, {
                            digitGroupSeparator: ",",
                            decimalCharacter: ".",
                            decimalPlaces: 0
                        });
                    }
                }, // 10, 자동 계산
                { title: "Exchange\ Rate\ (KRW/JPY)", data: "exchangeRate", width: "8%", render: formatDecimal }, // 11
                {
                    title: `Settlement\ Amount (KRW)`,
                    data: "settlementAmount",
                    width: "9%",
                    render: function (data) {
                        return AutoNumeric.format(data, {
                            digitGroupSeparator: ",",
                            decimalCharacter: ".",
                            decimalPlaces: 0
                        });
                    }
                }, // 12, 자동 계산
                {
                    title: "Deposit\ Date",
                    data: "depositAt",
                    render: function (data) {
                        return data ? moment(data).format('YYYY-MM-DD') : '-';
                    }, className: 'dt-center'
                }, // 13
                {
                    title: "New\ Bank\ Deposit",
                    data: null,
                    orderable: false,
                    render: function() {
                        return "<button class='btn btn-primary btn-xs newDepositBtn'>Deposit</button>";
                    }, visible: isAdmin, className: 'dt-center'
                }, // 14
                { data: "id", visible: false }, // 15
                { data: "orderNo", visible: false } // 16
            ],
            serverSide: false,
            processing: true,
            paging: true,
            order: [[1 , "desc"], [ORDER_NO, "asc"]],
            lengthMenu: [
                [50, 100, -1],
                [50, 100, 'All']
            ],
            rowId: "id",
            layout: {
                topEnd: {
                    buttons: [
                        ...(!isAdmin ? [
                            {
                                extend: "excel",
                                text: "Export to Excel",
                                className: 'btn btn-soft-secondary',
                                title: null,
                                filename: function () {
                                    const date = moment().format('YYMMDD');
                                    const randomNumber = Math.floor(Math.random() * 10000);
                                    return `dailySummary_${date}_${randomNumber}`;
                                },
                                customize: function (xlsx) {
                                    const sheet = xlsx.xl.worksheets['sheet1.xml'];

                                    $('c[r=H1], c[r=I1], c[r=J1], c[r=K1], c[r=L1], c[r=M1]', sheet).attr('s', '22');

                                    // 숫자 컬럼들에 대한 footer 서식 적용
                                    $('row:last c', sheet).each(function () {
                                        const cell = $(this);
                                        let value = cell.find('v').text();
                                        // 숫자가 아닌 경우 skip
                                        if (!value || isNaN(value.replace(/,/g, ''))) return;
                                        // 숫자로 변환 후 3자리 콤마 적용
                                        const formatted = Number(value).toLocaleString('en-US');
                                        cell.find('v').text(formatted);
                                        cell.attr('t', 'str');
                                        cell.attr('s', '53');
                                    });
                                },
                                exportOptions: {
                                    columns: [0, 1, 2, 3, 4, COUNTS, TOTAL_AMOUNT,
                                        FEE_JPY, TOTAL_REFUND_AMOUNT, TOTAL_PAYMENT_AMOUNT,
                                        EXCHANGE_RATE,
                                        SETTLEMENT_AMOUNT, DEPOSIT_DATE],
                                    format: {
                                        body: function (data, row, column) {
                                            // 열 번호가 0인 경우 행 번호 반환
                                            if (column === 0) {
                                                return row + 1;
                                            }
                                            // data가 null이거나 undefined인 경우 빈 문자열 반환
                                            if (data == null) {
                                                return '';
                                            }

                                            // jQuery 객체나 다른 형식의 데이터를 문자열로 변환
                                            let strData = String(data);

                                            // HTML 태그 제거
                                            strData = strData.replace(/<[^>]*>/g, '');

                                            // HTML 엔티티 디코딩
                                            strData = strData.replace(/&amp;/g, '&')
                                                .replace(/&lt;/g, '[')
                                                .replace(/&gt;/g, ']')
                                                .replace(/&quot;/g, '"')
                                                .replace(/&#39;/g, "'");

                                            return strData;
                                        },
                                    }
                                }
                            },
                        ] : [])
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
                    targets: [FEE_RATE, EXCHANGE_RATE, DEPOSIT_DATE],
                    createdCell: function (td) {
                        $(td).css('background-color', 'rgba(255,229,199,0.5)');
                    }
                },
                {
                    targets: [FEE_JPY, TOTAL_REFUND_AMOUNT, TOTAL_PAYMENT_AMOUNT, SETTLEMENT_AMOUNT, NEW_BANK_DEPOSIT],
                    createdCell: function (td) {
                        $(td).css('background-color', 'rgba(209,255,199,0.5)');
                    }
                },
                { targets: [1], className: 'dt-center' }
            ],
            rowCallback: function (row, data, index) {
                const pageInfo = this.api().page.info();
                const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
                $('td:eq(0)', row).html(reverseIndex);
            },
            footerCallback: function () {
                let api = this.api();
                $(api.table().footer()).show();

                // 합계 계산
                let totalCount = api
                    .column(COUNTS)
                    .data()
                    .reduce((a, b) => {
                        return Math.round(a) + Math.round(b || 0);
                    }, 0);
                let totalAmount = api
                    .column(TOTAL_AMOUNT)
                    .data()
                    .reduce((a, b) => {
                        return Math.round(a) + Math.round(b || 0);
                    }, 0);
                let totalFee = api
                    .column(FEE_JPY)
                    .data()
                    .reduce((a, b) => {
                        return Math.round(a) + Math.round(b || 0);
                    }, 0);
                let totalRefund = api
                    .column(TOTAL_REFUND_AMOUNT)
                    .data()
                    .reduce((a, b) => {
                        return Math.round(a) + Math.round(b || 0);
                    }, 0);
                let totalPayment = api
                    .column(TOTAL_PAYMENT_AMOUNT)
                    .data()
                    .reduce((a, b) => {
                        return Math.round(a) + Math.round(b || 0);
                    }, 0);
                let totalSettlement = api
                    .column(SETTLEMENT_AMOUNT)
                    .data()
                    .reduce((a, b) => {
                        return Math.round(a) + Math.round(b || 0);
                    }, 0);

                // Footer에 합계 표시
                $(api.column(COUNTS).footer()).html(totalCount.toLocaleString());
                $(api.column(TOTAL_AMOUNT).footer()).html(totalAmount.toLocaleString());
                $(api.column(FEE_JPY).footer()).html(totalFee.toLocaleString());
                $(api.column(TOTAL_REFUND_AMOUNT).footer()).html(totalRefund.toLocaleString());
                $(api.column(TOTAL_PAYMENT_AMOUNT).footer()).html(totalPayment.toLocaleString());
                $(api.column(SETTLEMENT_AMOUNT).footer()).html(totalSettlement.toLocaleString());

                // 색상 지정
                $(api.column(COUNTS).footer()).css({ "background-color": "rgba(234,234,234,0.5)" });
                $(api.column(TOTAL_AMOUNT).footer()).css({ "background-color": "rgba(234,234,234,0.5)" });
                $(api.column(FEE_JPY).footer()).css({ "background-color": "rgba(209,255,199,0.5)" });
                $(api.column(TOTAL_REFUND_AMOUNT).footer()).css({ "background-color": "rgba(209,255,199,0.5)" });
                $(api.column(TOTAL_PAYMENT_AMOUNT).footer()).css({ "background-color": "rgba(209,255,199,0.5)" });
                $(api.column(SETTLEMENT_AMOUNT).footer()).css({ "background-color": "rgba(209,255,199,0.5)" });
            }
        });
    }
    const table = await initializeTable();

    function fetchRangeData(data, callback) {
        getDateAndTime(isChecked);

        const startDateInput = $('#startDateInput').val();
        const endDateInput = $('#endDateInput').val();

        const selectedCustomerType = $('.searchCustomerType:checked').map(function() {
            return parseInt(this.value);
        }).get();
        const customers = selectedCustomerType.length === 0 ? [] : selectedCustomerType;

        $.ajax({
            url: '/api/pgManagement/dailySummary/range',
            type: 'GET',
            data: {
                startDate: startDateInput,
                endDate: endDateInput,
                types: customers,
            },
            dataType: 'json',
            success: function (response) {
                callback({
                    data: response
                });
            },
            error: function (xhr, status, error) {
                $("#loadingSpinner").hide();
                console.log("[Daily Summary] Error Message:", error);
            }
        })
    }

    /**
     * Summary Table Editor
     */
    const summaryEditor = new DataTable.Editor({
        ajax: {
            edit: {
                type: 'PUT',
                url: '/api/pgManagement/dailySummary/update',
                contentType: 'application/json',
                data: function (data) {
                    const editedData = [];

                    try {
                        Object.keys(data.data).forEach(key => {
                            const row = data.data[key];

                            const originalData = table
                                .row('#' + key)
                                .data();

                            if (!row || !originalData) {
                                console.error('행 데이터가 없습니다:', key);
                                return;
                            }

                            const convertToISO8601 = (dateString) => {
                                const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/;
                                if (dateRegex.test(dateString)) {
                                    return new Date(`${dateString}T00:00:00Z`).toISOString();
                                } else return dateString
                            };

                            editedData.push({
                                id: parseInt(key),
                                counts: parseInt(originalData.counts),
                                totalAmount: parseInt(originalData.totalAmount),
                                feeRate: parseFloat(row.feeRate) !== null ? parseFloat(row.feeRate) / 100 : parseFloat(originalData.feeRate),
                                exchangeRate: parseFloat(row.exchangeRate) !== null ? parseFloat(row.exchangeRate) : parseFloat(originalData.exchangeRate),
                                depositAt: convertToISO8601(row.depositAt) || convertToISO8601(originalData.depositAt) || null,
                            });
                        });

                        if (editedData.length === 0) {
                            return '[]';
                        }

                        return JSON.stringify(editedData);
                    } catch (error) {
                        console.error('데이터 처리 중 오류 발생:', error);
                        return '[]';
                    }
                },
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(header, token);
                },
                success: function () {
                    table.ajax.reload();
                },
                error: function (xhr, status, error) {
                    console.error('Error status:', error);
                    alert('Error. Please try again later.');
                }
            },
        },
        fields: [
            {
                label: 'Fee Rate(%)',
                name: 'feeRate',
                setFormatter: function (val) {
                    return val * 100;
                }
            },
            {
                label: 'Exchange Rate',
                name: 'exchangeRate',
            },
            {
                label: 'Deposit Date',
                name: 'depositAt',
                type: 'datetime',
                displayFormat: 'YYYY-MM-DD',
                momentFormat: 'YYYY-MM-DD',
                data: function (row) {
                    const date = row.depositAt ? row.depositAt.split('T')[0] : '';
                    return `${date}`;
                }
            }
        ],
        idSrc: "id",
        table: "#dailySummaryTable",
    })

    summaryEditor.on('preSubmit', function(e, data, action) {
        if (action !== 'edit') {
            return true;
        }

        Object.keys(data.data).forEach(key => {
            const row = data.data[key];

            if (row.feeRate !== undefined) {
                if (!(/^\d+$/).test(row.feeRate)) {
                    this.error('feeRate', 'Only numbers are allowed.');
                }
            }

            if (row.exchangeRate !== undefined) {
                if (!(/^\d*\.?\d{0,3}$/).test(row.exchangeRate)) {
                    this.error('exchangeRate', 'Only numbers, up to three decimal');
                }
            }
        });

        if (this.inError()) {
            return false;
        }
    });
    table.on('click', 'tbody td', function () {
        if (!isAdmin) return;

        let cellIndex = table.cell(this).index().column;

        if (cellIndex === FEE_RATE || cellIndex === EXCHANGE_RATE || cellIndex === DEPOSIT_DATE) {
            summaryEditor.inline(this);
        }
    });

    function formatDecimal(value) {
        if (value === null || value === undefined) return "";

        const num = Number(value);
        if (num === 0) return "0";

        const formattedNum = num
            .toFixed(10) // 소수점 이하 10자리까지 표시
            .replace(/\.?0+$/, ""); // 불필요한 0 제거

        // 정수와 소수 부분 분리
        const [integerPart, decimalPart] = formattedNum.split(".");

        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    }

    /**
     * 모달창 테이블
     */
    const modalData = document.getElementById("dailySummaryModal");
    let modal = bootstrap.Modal.getInstance(modalData);

    if (!modal) {
        modal = new bootstrap.Modal(modalData);
    }

    const TYPE_AMOUNT = 3;
    const TYPE_PAYMENT_AMOUNT = 4;

    const dailySummaryTypeTable = new DataTable("#dailySummaryTypeTable", {
        process: true,
        columns: [
            {title: "No.", data: null, width: "3%", orderable: false}, // 0
            {
                title: "Date", data: "depositDate", render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD') : '';
                },
            }, // 1
            {title: "Deposit Name", data: "depositName", orderable: false}, // 2
            {
                title: "Amount", data: "depositAmount", render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                },
            }, // 3
            {title: "Total Payment Amount(JPY)", data: null, width: "10%", visible: isAdmin,
                render: function (data, type, rowData) {
                    const amount = rowData.depositAmount * (1 - rowData.feeRate);
                    return AutoNumeric.format(Math.round(amount), {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
            }}, // 4
        ],
        serverSide: false,
        processing: true,
        paging: true,
        order: [],
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        layout: {
            topEnd: {
                buttons: []
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
                targets: [4],
                createdCell: function (td) {
                    $(td).css('background-color', 'rgba(209,255,199,0.5)');
                }
            },
        ],
        rowCallback: function (row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);
        },
        footerCallback: function () {
            let api = this.api();

            if (!isAdmin) {
                // 관리자가 아니면 Footer 숨김
                $(api.table().footer()).hide();
                return;
            }

            $(api.table().footer()).show();

            // 합계 계산
            let totalAmount = api
                .column(TYPE_AMOUNT)
                .data()
                .reduce((a, b) => {
                    return a + b;
                }, 0);
            let totalPayoutAmount = api
                .rows({ page: 'all' })
                .data()
                .reduce((sum, row) => {
                    const amount = row.depositAmount * (1 - row.feeRate);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);

            // Footer에 합계 표시
            $(api.column(TYPE_AMOUNT).footer()).html(Math.round(totalAmount).toLocaleString());
            $(api.column(TYPE_PAYMENT_AMOUNT).footer()).html(Math.round(totalPayoutAmount).toLocaleString());
        }
    });

    /**
     * 환불 테이블
     */
    const refundSummaryTypeTableEditor = new DataTable.Editor({
        ajax: {
            create: {
                type: "POST",
                url: "/api/pgManagement/dailySummary/refund/create",
                contentType: "application/json",
                data: function (data) {
                    const refundData = Object.values(data.data)[0];

                    return JSON.stringify({
                        accountDepositTypeId: parseInt(selectedTypeId),
                        depositDate: selectedDate,
                        depositName: refundData.depositName,
                        refundAmount: parseFloat(refundData.refundAmount),
                        refundFee: parseFloat(refundData.refundFee),
                        memo: refundData.memo || ""
                    });
                },
                success: function (response) {
                    alert(response.message);
                    refundSummaryTypeTableEditor.close();
                    fetchModalData(date, selectedTypeId);
                },
                error: function (response) {
                    alert(response.message);
                }
            },
            edit: {
                type: 'PUT',
                url: '/api/pgManagement/dailySummary/refund/update',
                contentType: 'application/json',
                data: function (data) {
                    try {
                        const rowId = Object.keys(data.data)[0];
                        const originalData = refundSummaryTypeTable.row('#' + rowId).data();

                        const editedData = Object.values(data.data)[0];

                        const updatedData = {
                            id: parseInt(originalData.id),
                            depositName: editedData.depositName || originalData.depositName,
                            refundAmount: editedData.refundAmount ? parseFloat(editedData.refundAmount) : parseFloat(originalData.refundAmount),
                            refundFee: editedData.refundFee ? parseFloat(editedData.refundFee) : parseFloat(originalData.refundFee),
                            memo: editedData.memo || originalData.memo,
                        }

                        return JSON.stringify(updatedData);
                    } catch (error) {
                        console.error('데이터 처리 중 오류 발생:', error);
                        return '[]';
                    }
                },
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(header, token);
                },
                success: function () {
                    refundSummaryTypeTableEditor.close();
                    fetchModalData(date, selectedTypeId);
                },
                error: function (xhr, status, error) {
                    console.error('Error status:', error);
                    alert('Error. Please try again later.');
                }
            },
        },
        fields: [
            {
                label: 'Deposit Name <span style=\"color: red;\">*</span>',
                name: 'depositName',
            },
            {
                label: 'Refund Amount <span style=\"color: red;\">*</span>',
                name: 'refundAmount',
            },
            {
                label: 'Refund Fee <span style=\"color: red;\">*</span>',
                name: 'refundFee',
            },
            {
                label: 'Memo',
                name: 'memo'
            },
        ],
        idSrc: "id",
        table: "#refundSummaryTypeTable",
        display: "lightbox",
    })
    refundSummaryTypeTableEditor.on('open', function (e, mode, action) {
        if (action !== 'edit') {
            $('#dailySummaryModal').modal('hide');
        }
    });
    refundSummaryTypeTableEditor.on('preSubmit', function(e, data, action) {
        if (action === 'remove') {
            return true
        }

        let depositName = this.field('depositName');
        let refundAmount = this.field('refundAmount');
        let refundFee = this.field('refundFee');
        let memo = this.field('memo');

        depositName.error("");
        refundAmount.error("");
        refundFee.error("");
        memo.error("");

        if (!depositName.val()) {
            depositName.error('Deposit Name must be given');
        }
        if (!refundAmount.val()) {
            refundAmount.error('Refund Amount must be given');
        }
        if (!refundFee.val()) {
            refundFee.error('Refund Fee must be given');
        }

        if (isHtml(depositName.val()) ) {
            depositName.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
        }
        if (isHtml(memo.val()) ) {
            memo.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
        }

        if (isNaN(refundAmount.val())) {
            refundAmount.error("Value be a number");
        }
        if (isNaN(refundFee.val())) {
            refundFee.error("Value be a number");
        }

        if (this.inError()) {
            return false;
        }
    });

    const REFUND_DEPOSIT_NAME = 3;
    const REFUND_AMOUNT = 4;
    const REFUND_FEE = 5;
    const REFUND_TABLE_TOTAL = 6;
    const REFUND_MEMO = 7;
    const REFUND_CREATE_AT = 8;
    const refundSummaryTypeTable = new DataTable("#refundSummaryTypeTable", {
        columns: [
            { data: null, orderable: false, render: DataTable.render.select(), width: "3%" }, // 0
            { title: "No.", data: null, width: "3%", orderable: false, className: "dt-head-center dt-body-center" }, // 1
            {
                title: "Date", data: "depositDate", render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD') : '';
                },
                width: "8%", className: "dt-head-center dt-body-center"
            }, // 2
            { title: "Deposit Name", data: "depositName", width: "10%", orderable: false }, // 3
            {
                title: "Refund Amount", data: "refundAmount", render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                },
            }, // 4
            {
                title: "Refund Fee", data: "refundFee", render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                },
            }, // 5
            {
                title: "Total Refund Amount", data: "totalRefundAmount", visible: isAdmin, render: function (data) {
                    return AutoNumeric.format(Math.round(data), {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                }
            }, // 6
            { title: "Memo", data: "memo", orderable: false }, // 7
            { data: "createAt", visible: false, render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD') : '';
                }
            }, // 8
        ],
        serverSide: false,
        processing: true,
        paging: true,
        order: [REFUND_CREATE_AT, "desc"],
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        layout: {
            topEnd: {
                buttons: [
                    {
                        text: 'Delete',
                        action: function () {
                            deleteRefundData();
                        },
                        className: 'btn btn-danger'
                    },
                    {
                        extend: "create",
                        text: "New Refund",
                        editor: refundSummaryTypeTableEditor,
                        className: 'btn btn-outline-primary width-l'
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
        columnDefs: [],
        rowCallback: function (row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(1)', row).html(reverseIndex);
        },
        createdRow: function (row) {
            const targetColumns = [REFUND_DEPOSIT_NAME, REFUND_AMOUNT, REFUND_FEE, REFUND_MEMO];

            targetColumns.forEach((columnIndex) => {
                $(row).find(`td:eq(${columnIndex})`).css('background-color', '#fff4cc');
            });
        },
        select: {
            selector: 'td:first-child'
        },
        rowId: 'id',
        footerCallback: function () {
            let api = this.api();

            $(api.table().footer()).show();

            // 합계 계산
            let totalRefund = api
                .column(REFUND_AMOUNT)
                .data()
                .reduce((a, b) => {
                    return Math.round(a) + Math.round(b || 0);
                }, 0);
            let totalRefundFee = api
                .column(REFUND_FEE)
                .data()
                .reduce((a, b) => {
                    return Math.round(a) + Math.round(b || 0);
                }, 0);
            let totalRefundAmount = api
                .column(REFUND_TABLE_TOTAL)
                .data()
                .reduce((a, b) => {
                    return Math.round(a) + Math.round(b || 0);
                }, 0);

            // Footer에 합계 표시
            $(api.column(REFUND_AMOUNT).footer()).html(totalRefund.toLocaleString());
            $(api.column(REFUND_FEE).footer()).html(totalRefundFee.toLocaleString());
            $(api.column(REFUND_TABLE_TOTAL).footer()).html(totalRefundAmount.toLocaleString());
        }
    });

    /* Refund 편집 기능 */
    refundSummaryTypeTable.on('click', 'tbody td', function () {
        let cellIndex = refundSummaryTypeTable.cell(this).index().column;

        if (cellIndex === REFUND_DEPOSIT_NAME
            || cellIndex === REFUND_AMOUNT
            || cellIndex === REFUND_FEE
            || cellIndex === REFUND_MEMO) {
            refundSummaryTypeTableEditor.inline(this);
        }
    });

    const fetchModalData = (date, typeId) => {
        $.ajax({
            url: '/api/pgManagement/dailySummary/type',
            type: 'GET',
            data: {
                date: date,
                typeId: parseInt(typeId)
            },
            dataType: 'json',
            success: function (data) {
                dailySummaryTypeTable.clear().rows.add(data).draw();
            },
            error: function (xhr, status, error) {
                console.log("[Daily Summary] Error Message:", error);
            }
        })

        $.ajax({
            url: '/api/pgManagement/dailySummary/refund/type',
            type: 'GET',
            data: {
                date: date,
                typeId: parseInt(typeId)
            },
            dataType: 'json',
            success: function (data) {
                refundSummaryTypeTable.clear().rows.add(data).draw();
            },
            error: function (xhr, status, error) {
                console.log("[Daily Summary] Error Message:", error);
            }
        })
    }

    function deleteRefundData() {
        const id = refundSummaryTypeTable.rows({ selected: true }).data().toArray().map(row => row.id);

        if (id.length === 0) {
            alert('Please select row to delete.');
            return;
        }

        $.ajax({
            method: 'DELETE',
            url: `/api/pgManagement/dailySummary/refund/delete/${id[0]}`,
            contentType: 'application/json',
            success: function (response) {
                alert(response.message);
                fetchModalData(date, selectedTypeId);
            },
            error: function (xhr) {
                if (xhr.responseJSON) {
                    alert(xhr.responseJSON.message);
                } else {
                    alert("An error occurred while processing your request.");
                }
            }
        });
    }

    // 세부 내역 모달창 오픈
    let selectedDate, selectedTypeId;
    $('#dailySummaryTable').on('click', `td:nth-child(${COUNTS+1})`, function(e) {
        e.preventDefault();

        const row = $(this).closest('tr');
        const rowData = table.row(row).data();
        if (!rowData) return;

        selectedDate = moment(rowData.createdAt).format('YYYY-MM-DD');
        selectedTypeId = rowData.accountDepositTypeId;
        const type = rowData.customerType

        fetchModalData(selectedDate, selectedTypeId);
        $("#modalTitle").text(`${type}`);

        modal.show();
    });

    // New Bank Deposit 이동
    $('#dailySummaryTable tbody').on('click', '.newDepositBtn', function(e) {
        e.preventDefault();

        let rowData = table.row($(this).closest('tr')).data();

        const ecCustomerId = rowData.ecCustomerId;
        const amount = Math.round(rowData.settlementAmount);

        if (!ecCustomerId) {
            alert("Please select 'Receiver' at Customer Type Management page. ")
        } else {
            window.location.href = `/pgManagement/newBankDepositManagement?ecId=${ecCustomerId}&amount=${amount}`;
        }
    });

    $('#dailySummaryTable').on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        $('#dailySummaryTable').DataTable().page.len(pageLength);
    }, 0);
});