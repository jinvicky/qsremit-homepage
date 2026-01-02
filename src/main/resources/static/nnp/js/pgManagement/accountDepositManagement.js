$(document).ready(async function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    // 공통으로 사용되는 날짜 재선언
    let startDate, endDate, today, todayTime, period;
    function getDateAndTime() {
        startDate = $("#startDate").val();
        endDate = $("#endDate").val();
        today = moment().format('YYYY-MM-DD');
        todayTime = moment().format('HH:mm');
        period = endDate === today ? `(${startDate} 00:00 ~ ${endDate} ${todayTime})`: `(${startDate} 00:00 ~ ${endDate} 23:59)`;
    }

    // ajax 초기화
    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    // 검색 필드
    $("#genderSelect").hide();
    $("#searchText").attr("placeholder", "Search");
    $("#columnSelect").on("change", function () {
        handleColumnSelect();
    })
    handleColumnSelect();
    function handleColumnSelect() {
        const selected = $("#columnSelect").val();
        if (selected === "customerGender") {
            $("#genderSelect").show();
            $("#searchText").hide();
            $("#searchText").val("");
        } else {
            $("#genderSelect").hide();
            $("#searchText").show();

            const placeholderMap = {
                depositAmount: "Amount should be equal",
                customerNum: "Search by Number"
            };

            $("#searchText").attr("placeholder", placeholderMap[selected] || "Search");
        }
    }

    const modalData = document.getElementById("accountDepositCustomerType");
    let modal = bootstrap.Modal.getInstance(modalData);

    if (!modal) {
        modal = new bootstrap.Modal(modalData);
    }

    const formattedDate = moment().format('YYYY-MM-DD');
    let isAdmin = false;

    $.ajax({
        url: "/user/api/userRole", // 권한 정보를 조회하는 API
        method: "GET",
        success: function (response) {
            isAdmin = response.includes("ADMIN");
        },
        error: function (xhr, status, error) {
            console.error("Cannot get user role:", error);
        }
    });

    // 계좌 별 색상 지정
    // 1. 은행 별 계좌 목록
    async function getBankAccounts() {
        try {
            const response = await fetch('/api/pgManagement/accountDepositManagement/bank', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Fail to get Data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error: ', error);
            throw error;
        }
    }
    // 2. 계좌 별 색상데이터 로드
    let bankColors = {};
    async function getSavedColors() {
        try {
            const response = await fetch('/api/pgManagement/accountDepositManagement/bank/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get colors.');
            }

            bankColors = await response.json();
        } catch (error) {
            console.error('Error while getting bank colors: ', error);
            bankColors = {};
        }
    }

    // Summary 테이블 구성 함수
    function getSummaryTable(options) {
        const customerTypeSummary = document.getElementById('customerTypeSummary');
        customerTypeSummary.textContent = '';

        const toIdSafe = (v) => `data-${String(v).trim().replace(/[^\w-]/g, '_')}`;

        options.forEach(type => {
            const row = document.createElement('tr');
            if (type.active) {
                row.classList.add('bg-light');

                const td1 = document.createElement('td');
                td1.textContent = "";

                const td2 = document.createElement('td');

                const td3 = document.createElement('td');
                td3.classList.add('text-end');

                if (!type.isNullable) {
                    row.id = toIdSafe(type.id);
                    td1.textContent = type.label;
                } else {
                    row.id = toIdSafe('null');
                    td1.textContent = `${type.label} (Empty Type)`;
                }
                row.append(td1, td2, td3);
            }
            customerTypeSummary.appendChild(row);
        });
    }

    // 은행별 계좌 목록과 색상 목록 불러오는 함수
    async function fetchBankColorData() {
        try {
            await getBankAccounts();
            await getSavedColors();

            return true;
        } catch (error) {
            console.error('Error while fetching Bank Color data: ', error);
            return false;
        }
    }

    // customerType, bank colors 먼저 가져오는 함수
    async function fetchOptions() {
        const data = await $.ajax({
            url: '/api/pgManagement/accountDepositManagement/types',
            type: 'GET',
            dataType: 'json'
        });

        const options = data.map(type => ({
            id: type.id,
            label: unescapeSpecialCharacters(type.customerType),
            value: unescapeSpecialCharacters(type.customerType),
            isNullable: type.isNullable,
            orderNo: type.orderNo,
            active: type.active,
        }));

        getSummaryTable(options);
        await fetchBankColorData();

        return options;
    }

    /**
     * Customer Type 데이터 가져온 후 동작
     */
    fetchOptions().then(function (options) {
        getDateAndTime();
        $("#summary").text(`Summary ${period}`);

        const notNullOptions = options.filter(option => !option.isNullable && option.active);

        // customer type 별 Deposit 목록 모달창 오픈
        $('#customerTypeSummary').on('click', '[id^="data-"]', function(e) {
            e.preventDefault();
            getDateAndTime();

            const elementId = this.id;
            const searchType = $("#columnSelect").val();
            const searchText = searchType === "customerGender" ? $("#genderSelect").val() : $("#searchText").val();

            if (elementId === 'data-null') { // Empty Type일 경우
                fetchNullData(startDate, endDate, elementId, searchType, searchText);
                modal.show();
                $("#modalTitle").text(`Empty Type ${period}`);
            } else { // 아닐 경우
                const type = notNullOptions.find(opt => `data-${opt.id}` === elementId);
                fetchModalData(startDate, endDate, type.value, searchType, searchText);
                modal.show();
                $("#modalTitle").text(`${type.value} ${period}`);
            }
        });

        // 인라인 editor
        const inlineEditor = new DataTable.Editor({
            ajax: {
                edit: {
                    type: 'PUT',
                    url: `/api/pgManagement/accountDepositManagement/update/{id}`,
                    contentType: 'application/json',
                    data: function (data) {
                        const urlTemplate = this.url;
                        const id = urlTemplate.match(/update\/(\d+)/)[1];

                        const originalData = table
                            .rows()
                            .data()
                            .toArray()
                            .find((row) => row.id === id);

                        if (!originalData) {
                            console.error("Original data not found for ID:", id);
                            return JSON.stringify({error: "Original data not found"});
                        }

                        const editedItem = Object.values(data.data)[0];
                        const fullUpdateData = {...originalData, ...editedItem};
                        const convertToISO8601 = (dateString) => {
                            const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/;
                            if (dateRegex.test(dateString)) {
                                return new Date(`${dateString}T00:00:00Z`).toISOString();
                            } else return dateString
                        };
                        fullUpdateData.customerBirthDate = convertToISO8601(fullUpdateData.customerBirthDate);
                        if (fullUpdateData.customerType === '') {
                            fullUpdateData.customerType = null;
                        }
                        if (fullUpdateData.customerGender === '') {
                            fullUpdateData.customerGender = null;
                        }

                        return JSON.stringify(fullUpdateData);
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(header, token);
                    },
                    success: function () {
                        $("#searchBtn").trigger("click");
                    },
                    error: function (xhr, status, error) {
                        console.log("[Account] Saving Error Message:", error);
                    }
                },
            },
            table: "#accountDepositManagementTable",
            idSrc: "id",
            fields: [
                {
                    label: "customerType", name: "customerType", type: "select",
                    options: notNullOptions
                },
                {label: "customerNum", name: "customerNum",
                },
                {label: "customerName", name: "customerName"},
                {
                    label: "gender", name: "customerGender", type: "select",
                    options: [
                        {label: "", value: ""},
                        {label: "MALE", value: "MALE"},
                        {label: "FEMALE", value: "FEMALE"}
                    ]
                },
                {
                    label: "birthDate",
                    name: "customerBirthDate",
                    type: "datetime",
                    format: "YYYY-MM-DD",
                    opts: {
                        maxDate: new Date(),
                        yearRange: 500,
                        defaultDate: new Date()
                    },
                    data: function (row) {
                        const date = row.customerBirthDate ? row.customerBirthDate.split('T')[0] : '';
                        return `${date}`;
                    }
                },
                {label: "address", name: "customerAddress"},
                {label: "memo", name: "memo"}
            ],
        })

        // 테이블 색상 변경하는 columnDefs 설정
        function getCommonColumnDefs() {
            return [
                {
                    targets: [0, 1, 2, 3],
                    createdCell: function (td, cellData, rowData) {
                        const bankKey = `${rowData.bank}-${rowData.accountName}`;
                        const color = bankColors[bankKey] || '#ffffff';
                        $(td).css('background-color', color);
                    }
                },
                {
                    targets: [4, 5, 6, 7],
                    createdCell: function (td, cellData, rowData) {
                        if (rowData.addressChanged) {
                            $(td).css('background-color', 'rgba(255,161,161,0.51)');
                        }
                    }
                }
            ];
        }

        // Validate
        inlineEditor.on('preSubmit', function (e, o, action) {
            const customerNum = this.field('customerNum');
            const customerName = this.field('customerName');
            const customerAddress = this.field('customerAddress');
            const memo = this.field('memo');

            customerNum.error('');
            customerName.error('');
            customerAddress.error('');
            memo.error('');

            if (action !== 'remove') {
                if (isHtml(customerNum.val())) {
                    customerNum.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
                }

                if (isHtml(customerName.val())) {
                    customerName.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
                }

                if (isHtml(customerAddress.val())) {
                    customerAddress.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
                }

                if (isHtml(memo.val())) {
                    memo.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
                }

                if (this.inError()) {
                    return false;
                }
            }
        });

        // Data 테이블 컬럼들
        const columns = [
            {title: "No.", data: null, width: "3%", orderable: false, className: "dt-head-center dt-body-center" }, // 0
            {
                title: "Date", data: "depositDate", render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD') : '';
                },
                width: "10%", className: "dt-head-center dt-body-center"
            }, // 1
            { title: "Deposit Name", data: "depositName", width: "10%", orderable: false}, // 2
            {
                title: "Amount", data: "depositAmount", render: function (data) {
                    return AutoNumeric.format(data, {
                        digitGroupSeparator: ",",
                        decimalCharacter: ".",
                        decimalPlaces: 0
                    });
                },
            }, // 3
            {title: "Customer Type", data: "customerType", width: "5%", orderable: false}, // 4
            {title: "Customer Number", data: "customerNum", width: "5%", className: "text-start", orderable: false}, // 5
            {title: "Customer Name", data: "customerName"}, // 6
            {title: "Gender", data: "customerGender", width: "5%", orderable: false}, // 7
            {
                title: "Birth Date", data: "customerBirthDate", orderable: false,
                defaultContent: "",
                render: function (data) {
                    return data ? moment(data).format('YYYY-MM-DD') : '';
                },
                width: "8%"
            }, // 8
            {title: "Address", data: "customerAddress", width: "25%", className: "text-start", orderable: false}, // 9
            {title: "Memo", data: "memo", className: "text-start", orderable: false}, // 10
            {
                title: "Action",
                data: null,
                render: function () {
                    return (
                        "<div class='action-buttons'>" +
                        "<span class='edit'><i class='fa fa-edit' style='font-size: 1.5em;'></i></span> " +
                        (isAdmin ? "&nbsp;&nbsp;<span class='remove'><i class='fa fa-trash' style='font-size: 1.5em;'></i></span> " : "") +
                        "<span class='cancel'></span>" +
                        "</div>"
                    );
                },
                className: "row-edit dt-center",
                orderable: false,
                width: "100px"
            }, // 11
            { data: "createdAt", visible: false }, // 12
        ];

        // 기본 Table 초기화
        const table = new DataTable("#accountDepositManagementTable", {
            columns: columns,
            searching: false,
            serverSide: false,
            processing: true,
            paging: true,
            order: [[1, "desc"], [ 12, "desc" ]],
            lengthMenu: [
                [50, 100, -1],
                [50, 100, 'All']
            ],
            rowId: "id",
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
                                return `accountDeposit_${date}_${randomNumber}`;
                            },
                            customize: function (xlsx) {
                                const sheet = xlsx.xl.worksheets['sheet1.xml'];

                                $('c[r=A1], c[r=B1], c[r=C1], c[r=D1]', sheet).attr('s', '22');
                            },
                            exportOptions: {
                                columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                                format: {
                                    body: function (data, row, column) {
                                        if (column === 0) {
                                            return row + 1;
                                        }
                                        return data;
                                    }
                                }
                            }
                        },
                        ...(isAdmin ? [
                            {
                                extend: "create",
                                text: "New Account Deposit",
                                editor: accountDepositEditor,
                                className: 'btn btn-outline-primary width-xl'
                            }
                        ] : []),
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
            columnDefs: getCommonColumnDefs(),
            rowCallback: function (row, data, index) {
                const pageInfo = this.api().page.info();
                const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
                $('td:eq(0)', row).html(reverseIndex);
            },
        });

        table.on('length.dt', function(e, settings, len) {
            $("#tablePageInput").val(len);
        });

        setTimeout(() => {
            const pageLength = $("#tablePageInput").val() || 50;
            table.page.len(pageLength);
        }, 0);

        // 모달 Table 초기화
        const customerTypeTable = new DataTable("#accountDepositCustomerTypeTable", {
            columns: [
                {title: "No.", data: null, width: "3%", orderable: false}, // 0
                {
                    title: "Date", data: "depositDate", render: function (data) {
                        return data ? moment(data).format('YYYY-MM-DD') : '';
                    },
                    width: "8%"
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
                    width: "4%"
                }, // 3
                {title: "Customer Type", data: "customerType", width: "5%", orderable: false}, // 4
                {title: "Customer Number", data: "customerNum", width: "5%", className: "text-start", orderable: false}, // 5
                {title: "Customer Name", data: "customerName"}, // 6
                {title: "Gender", data: "customerGender", width: "5%", orderable: false}, // 7
                {
                    title: "Birth Date", data: "customerBirthDate", orderable: true,
                    defaultContent: "",
                    render: function (data) {
                        return data ? moment(data).format('YYYY-MM-DD') : '';
                    },
                    width: "8%"
                }, // 8
                {title: "Address", data: "customerAddress", width: "25%", className: "text-start", orderable: false}, // 9
                {title: "Memo", data: "memo", className: "text-start", orderable: false}, // 10
                {data: "createdAt", visible: false}, // 11
            ],
            searching: false,
            serverSide: false,
            processing: true,
            paging: true,
            order: [[1, "desc"], [ 11, "desc" ]],
            lengthMenu: [
                [50, 100, -1],
                [50, 100, 'All']
            ],
            autoWidth: true,
            rowId: "id",
            layout: {
                topEnd: {
                    buttons: [
                        {
                            extend: "excel",
                            text: "Export to Excel",
                            className: 'btn btn-soft-secondary',
                            title: null,
                            filename: function () {
                                const title = $("#modalTitle").text();

                                const randomNumber = Math.floor(Math.random() * 10000);
                                return `accountDeposit_${title}_${randomNumber}`;
                            },
                            customize: function (xlsx) {
                                const sheet = xlsx.xl.worksheets['sheet1.xml'];

                                $('c[r=A1], c[r=B1], c[r=C1], c[r=D1]', sheet).attr('s', '22');
                            },
                            exportOptions: {
                                columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                                format: {
                                    body: function (data, row, column) {
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
            initComplete: function () {
                $('.dt-button').removeClass('dt-button');

                initializeTableResize(this, {
                    minWidth: 40,
                    excludeLastColumns: 1
                });
            },
            columnDefs: getCommonColumnDefs(),
            rowCallback: function (row, data, index) {
                const pageInfo = this.api().page.info();
                const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
                $('td:eq(0)', row).html(reverseIndex);
            }
        });

        // 인라인 편집 후 저장 버튼 클릭
        clickEditButton(table, inlineEditor);

        // 기본 테이블 데이터 fetch
        const fetchData = (startDate, endDate, customers, searchType, searchText) => {
            $.ajax({
                url: '/api/pgManagement/accountDepositManagement/',
                type: 'GET',
                data: {
                    startDate: startDate,
                    endDate: endDate,
                    types: customers,
                    searchType: searchType,
                    searchValue: searchText
                },
                dataType: 'json',
                success: function (data) {
                    table.clear().rows.add(data).draw();
                    updateTotalAmountRow(table);
                },
                error: function (xhr, status, error) {
                    console.log("[Account] Error Message:", error);
                }
            })
        }

        fetchData(formattedDate, formattedDate);

        // 모달 테이블 데이터 fetch
        const fetchModalData = (startDate, endDate, customers, searchType, searchText) => {
            $.ajax({
                url: `/api/pgManagement/accountDepositManagement/`,
                type: 'GET',
                data: {
                    startDate: startDate,
                    endDate: endDate,
                    types: customers,
                    searchType: searchType,
                    searchValue: searchText
                },
                dataType: 'json',
                success: function (data) {
                    customerTypeTable.clear().rows.add(data).draw();
                },
                error: function (xhr, status, error) {
                    console.log("[Account] Error Message:", error);
                }
            })
        }

        // null 포함 테이블 데이터 fetch
        const fetchNullData = (startDate, endDate, customers, searchType, searchText, isSearch = false) => {
            $.ajax({
                url: `/api/pgManagement/accountDepositManagement/null`,
                type: 'GET',
                data: {
                    startDate: startDate,
                    endDate: endDate,
                    types: customers,
                    searchType: searchType,
                    searchValue: searchText
                },
                dataType: 'json',
                success: function (data) {
                    customerTypeTable.clear().rows.add(data).draw();
                    if (isSearch) {
                        table.clear().rows.add(data).draw();
                        updateTotalAmountRow(customerTypeTable);
                    }
                },
                error: function (xhr, status, error) {
                    console.log("[Account] Error Message:", error);
                }
            })
        }

        // 검색 버튼 클릭 이벤트
        $("#searchBtn").on("click", function () {
            const selectedCustomerType = $('.searchCustomerType:checked').map(function() {
                return this.value;
            }).get();
            const customers = selectedCustomerType.length === 0 ? [] : selectedCustomerType;
            const searchType = $("#columnSelect").val();
            const searchText = searchType === "customerGender" ? $("#genderSelect").val() : $("#searchText").val();

            getDateAndTime();
            $("#summary").text(`Summary ${period}`);

            const validValues = notNullOptions.map(opt => opt.value);
            const isCustomerInOptions = customers.length !== 0 ? customers.every(option => validValues.includes(option)) : true;

            if (searchText === "" && isCustomerInOptions) {
                fetchData(startDate, endDate, customers, searchType, searchText);
            } else {
                fetchNullData(startDate, endDate, customers, searchType, searchText, true);
            }
        })

        // Enter 키 이벤트
        $(document).on("keypress", function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                $("#searchBtn").trigger("click");
            }
        });

        function filterTableByCustomerType(table, customerType) {
            return table
                .rows()
                .data()
                .toArray()
                .filter(row => row.customerType === customerType);
        }

        function updateTotalAmountRow(table) {
            const selectedCustomerType = $('.searchCustomerType:checked').map(function() {
                return this.value;
            }).get();

            // Total 값 초기화
            let totalCount = 0;
            let totalAmount = 0;

            // 데이터 계산 및 표시
            function getTotalData(type, data) {
                const counts = data.length;
                const totalAmount = data.reduce((sum, row) => sum + (row.depositAmount || 0), 0);

                const selector = !type?.isNullable ? `#data-${type.id}` : "#data-null";
                $(`${selector} td:eq(1)`).text(`${counts}`);
                $(`${selector} td:eq(2)`).text(AutoNumeric.format(totalAmount, {
                    digitGroupSeparator: ",",
                    decimalCharacter: ".",
                    decimalPlaces: 0
                }));

                return { counts, totalAmount };
            }

            // 1. selectedCustomerType가 비어있는 경우 = 전체
            if (selectedCustomerType.length === 0) {
                getSummaryTable(options);

                options.forEach(type => {
                    const typeData = filterTableByCustomerType(table, !type.isNullable ? type.value : null);
                    const result = getTotalData(type, typeData);

                    totalCount += result.counts;
                    totalAmount += result.totalAmount;
                });
            } else {
                const selectedTypeData = options.filter(option => selectedCustomerType.includes(option.value));
                getSummaryTable(selectedTypeData);

                selectedTypeData.forEach(type => {
                    const typeData = filterTableByCustomerType(table, type && !type.isNullable ? type.value : null);
                    const result = getTotalData(type, typeData);

                    totalCount += result.counts;
                    totalAmount += result.totalAmount;
                });
            }

            // Total 행 업데이트
            $("#data-total td:eq(1) b").text(`${totalCount}`);
            $("#data-total td:eq(2) b").text(AutoNumeric.format(totalAmount, {
                digitGroupSeparator: ",",
                decimalCharacter: ".",
                decimalPlaces: 0
            }));
        }

        clickRemoveButton(table, accountDepositEditor);

        // 색상 변경 시 테이블 새로고침
        function refreshTableColors() {
            table.rows().every(function () {
                const rowData = this.data();
                const bankKey = `${rowData.bank}-${rowData.accountName}`;
                const color = bankColors[bankKey] || '#ffffff';

                $(this.node()).find('td').slice(0, 4).css('background-color', color);
            });

            customerTypeTable.rows().every(function () {
                const rowData = this.data();
                const bankKey = `${rowData.bank}-${rowData.accountName}`;
                // const color = bankColors[bankKey] || '#ffffff';

                // $(this.node()).find('td').slice(0, 4).css('background-color', color);
            });
        }

        // 색상 저장
        function saveColor(bankKey, color) {
            const [bank, accountName] = bankKey.split('-');

            $.ajax({
                url: '/api/pgManagement/accountDepositManagement/bank/update',
                type: 'PUT',
                data: {
                    bank: bank,
                    accountName: accountName,
                    color: color
                },
                success: async function() {
                    await getSavedColors();
                    refreshTableColors();
                },
                error: function(xhr, status, error) {
                    console.error('Error while updating bank color: ', error);
                }
            });
        }
        // 색상 Picker 생성
        function createColorPicker(bankElement, bankKey, initialColor, isAdmin) {
            const colorPicker = $('<input type="color" class="color-picker">')
                .val(initialColor);

            if (!isAdmin) {
                colorPicker.attr("disabled", true);
            }

            colorPicker.on('change', function(e) {
                const selectedColor = e.target.value;
                saveColor(bankKey, selectedColor);
            });

            return colorPicker;
        }

        // 계좌 별 색상 표시
        getBankAccounts()
            .then(async bankAccounts => {
                const savedColors = bankColors;
                const bankCounts = bankAccounts.reduce((acc, account) => {
                    acc[account.bank] = (acc[account.bank] || 0) + 1;
                    return acc;
                }, {});

                const html = bankAccounts.map(account => {
                    const bankKey = `${account.bank}-${account.accountName}`;
                    const savedColor = savedColors[bankKey] || '#ffffff';

                    const listItem = $(`<div class="color-picker-wrapper">
                        <p class="p-1 mb-0 color-picker-text">
                            ${ bankCounts[account.bank] === 1 ? account.bank : `${account.bank} - ${account.accountName}` }
                        </p>
                    </div>`);

                    // admin 단계만 색상 수정 가능
                    const colorPicker = createColorPicker(listItem.find('p'), bankKey, savedColor, isAdmin);
                    listItem.prepend(colorPicker);

                    return listItem;
                });

                $(".bank-color-list").empty().append(html);

                if (isAdmin) {
                    $(".bank-color-list-wrapper").append(
                        $(`<p class="mb-0 pt-1">
                                Click the color box to select your desired color
                            </p>`)
                    )
                }

            })
            .catch(error => { console.error('Error: ', error); });

        /**
         * 주소 변경 적용하는 모달 테이블
         */
        const changeAddressTable = new DataTable("#accountDepositAddressTable", {
            columns: [
                {title: "No.", data: null, width: "3%", orderable: false}, // 0
                {
                    title: "Date", data: "depositDate", render: function (data) {
                        return data ? moment(data).format('YYYY-MM-DD') : '';
                    },
                    width: "5%"
                }, // 1
                {title: "Deposit Name", data: "depositName", width: "5%", orderable: false}, // 2
                {
                    title: "Amount", data: "depositAmount", width: "5%",
                    render: function (data) {
                        return AutoNumeric.format(data, {
                            digitGroupSeparator: ",",
                            decimalCharacter: ".",
                            decimalPlaces: 0
                        });
                    },
                }, // 3
                {title: "Customer Type", data: "customerType", width: "5%", orderable: false}, // 4
                {title: "Customer Number", data: "customerNum", width: "5%", className: "text-start", orderable: false}, // 5
                {title: "Customer Name", data: "customerName"}, // 6
                {title: "Address", data: "customerAddress", width: "70%", className: "text-start", orderable: false}, // 7
                {
                    title: "Action",
                    data: null,
                    render: function () {
                        return (
                            "<div class='action-buttons'>" +
                            "<span class='edit'><i class='fa fa-edit' style='font-size: 1.5em;'></i></span> " +
                            "<span class='cancel'></span>" +
                            "</div>"
                        );
                    },
                    className: "row-edit dt-center",
                    orderable: false,
                    width: "100px"
                }, // 8
                { data: "createdAt", visible: false }, // 9
                { data: "bank", visible: false }, // 10
                { data: "accountName", visible: false }, // 11
            ],
            searching: false,
            serverSide: false,
            processing: true,
            paging: true,
            order: [[1, "desc"], [ 9, "desc" ]],
            lengthMenu: [
                [50, 100, -1],
                [50, 100, 'All']
            ],
            autoWidth: true,
            rowId: "id",
            layout: {
                topEnd: { }
            },
            columnDefs: getCommonColumnDefs(),
            initComplete: function () {
                initializeTableResize(this, {
                    minWidth: 40,
                    excludeLastColumns: 1
                })
            },
            rowCallback: function (row, data, index) {
                const pageInfo = this.api().page.info();
                const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
                $('td:eq(0)', row).html(reverseIndex);
            }
        });

        let tableData;
        function updateAddressData(changeData) {
            const editedItem = changeData.data[Object.keys(changeData.data)[0]];
            const rowId = Object.keys(changeData.data)[0];

            const rowIndex = tableData.findIndex(item => item.id === rowId);
            if (rowIndex !== -1) {
                tableData[rowIndex].customerAddress = editedItem.customerAddress;
            }
        }
        const addressInlineEditor = new DataTable.Editor({
            table: "#accountDepositAddressTable",
            idSrc: "id",
            fields: [
                {label: "address", name: "customerAddress"}
            ],
            ajax: function(method, url, data, success) {
                updateAddressData(data);
                success({});
                changeAddressTable.clear().rows.add(tableData).draw();
            }
        });
        // 주소 변경 테이블에서 inline 편집 활성화
        clickEditButton(changeAddressTable, addressInlineEditor);

        /**
         * 주소 변경 엑셀 업로드
         */
        const addressModalData = document.getElementById("accountDepositAddressChange");
        let addressModal = bootstrap.Modal.getInstance(addressModalData);

        if (!addressModal) {
            addressModal = new bootstrap.Modal(addressModalData);
        }

        function uploadAddressExcel() {
            const fileInput = $('<input type="file" accept=".xls,.xlsx,.csv" style="display:none">');

            $("#uploadExcelButton").on("click", function () {
                fileInput.click();
            });

            fileInput.on('change', function(e) {
                Swal.fire({
                    title: 'Fetching data...',
                    html: '',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const file = e.target.files[0];
                if (!file) return;

                const startDate = $("#startDate").val();
                const endDate = $("#endDate").val();

                const formData = new FormData();
                formData.append('startDate', startDate);
                formData.append('endDate', endDate);
                formData.append('file', file);

                $.ajax({
                    url: '/api/pgManagement/accountDepositManagement/excel/find',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        tableData = data;
                        changeAddressTable.clear().rows.add(data).draw();
                        updateTotalAmountRow(changeAddressTable);

                        Swal.close();
                        addressModal.show();
                    },
                    error: function (xhr) {
                        alert(xhr.responseJSON.error)
                    },
                    complete: function() {
                        Swal.close();
                    }
                })

                fileInput.val('');
            });
        }

        $(".changeAddressBtn").on("click", async function () {
            Swal.fire({
                title: 'Saving Data...',
                html: 'Wait for data to be saved.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            tableData = tableData.map(item => ({
                ...item,
                depositAmount: Number(item.depositAmount),
                id: Number(item.id),
                addressChanged: Boolean(item.addressChanged)
            }));

            try {
                const response = await $.ajax({
                    url: "/api/pgManagement/accountDepositManagement/excel/update",
                    type: "PUT",
                    data: JSON.stringify(tableData),
                    contentType: 'application/json',
                    processData: false
                });

                if (response.message) {
                    Swal.close();
                    alert(response.message);
                    $("#searchBtn").trigger("click");
                } else {
                    alert("Address update failed.");
                }
            } catch (error) {
                console.error("Error updating address:", error);
                alert("Address update failed.");
            }
        });
        uploadAddressExcel();
    })

    const accountDepositEditor = new DataTable.Editor({
        table: "#accountDepositManagementTable",
        idSrc: "id",
        fields: [
            {
                label: "Bank - Account <span style=\"color: red;\">*</span>",
                name: "bankAccount",
                type: "select",
                options: [],
            },
            {label: "Deposit Name <span style=\"color: red;\">*</span>", name: "depositName"},
            {label: "Amount <span style=\"color: red;\">*</span>", name: "depositAmount"},
            {
                label: "Deposit Date <span style=\"color: red;\">*</span>", name: "depositDate", type: "datetime", format: "YYYY-MM-DD", def: function () {
                    return moment().format('YYYY-MM-DD');
                },
                opts: {
                    maxDate: new Date(),
                }
            },
        ],
        ajax: {
            create: {
                type: "POST",
                url: "/api/pgManagement/accountDepositManagement/new",
                contentType: "application/json",
                data: function (data) {
                    const depositData = Object.values(data.data)[0];
                    const [bank, accountName] = depositData.bankAccount.split('-');
                    depositData.bank = bank.trim();
                    depositData.accountName = accountName.trim();
                    delete depositData.bankAccount;

                    depositData.depositName = depositData.depositName.trim();

                    return JSON.stringify(validateDate(depositData));
                },
                success: function (response) {
                    alert(response.message);
                    accountDepositEditor.close();
                    window.location.reload();
                },
                error: function (response) {
                    alert(response.message);
                }
            },
            remove: {
                type: "DELETE",
                url: `/api/pgManagement/accountDepositManagement/delete/{id}`,
                success: function (response) {
                    alert(response.message);
                    accountDepositEditor.close();
                    window.location.reload();
                },
                error: function (response) {
                    console.log("[Account] Error Message:", response);
                }
            },
        }
    })

    accountDepositEditor.on('open', async function() {
        try {
            const accounts = await getBankAccounts();
            const bankCounts = accounts.reduce((acc, account) => {
                acc[account.bank] = (acc[account.bank] || 0) + 1;
                return acc;
            }, {});

            const options = accounts.map(account => ({
                label: bankCounts[account.bank] === 1 ? account.bank : `${account.bank} - ${account.accountName}`,
                value: `${account.bank}-${account.accountName}`
            }));

            accountDepositEditor.field('bankAccount').update(options);
        } catch (error) {
            console.error('Error loading bank accounts:', error);
        }
    });

    accountDepositEditor.on('preSubmit', function (e, o, action) {
        const depositDate = this.field('depositDate');
        depositDate.error('');

        if (action === 'create') {
            const dateVal = depositDate.val();

            if (dateVal) {
                const date = moment(dateVal, moment.ISO_8601, true);

                if (!date.isValid()) {
                    depositDate.error('Invalid date format.');
                }
            }
        }
    });

    accountDepositEditor.on('preSubmit', function (e, o, action) {
        const amount = this.field('depositAmount');
        const depositDate = this.field('depositDate');
        const depositName = this.field('depositName');

        amount.error('');
        depositDate.error('');
        depositName.error('');

        if (action === 'create' || action === 'edit') {
            const amountVal = amount.val();
            const depositDateVal = depositDate.val();
            const depositNameVal = depositName.val();
            if (depositDateVal) {
                const depositDateObj = moment(depositDateVal, moment.ISO_8601, true);
                if (!depositDateObj.isValid()) {
                    depositDate.error('Invalid deposit date format.');
                }
            } else {
                depositDate.error('Deposit date is required.');
            }

            if(!depositNameVal) {
                depositName.error('Account Holder is required.');
            }

            if (amountVal) {
                if (!amountVal.match(/^[0-9]+$/)) {
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

    function validateDate(data) {
        if (data.depositDate !== null) {
            data.depositDate = moment(data.depositDate, moment.ISO_8601, true).format("YYYY-MM-DD");
        }
        return data;
    }

    $("#downloadFormButton").on("click", function () {
        fetch('/api/pgManagement/accountDepositManagement/excel/download', {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'account_deposit_address_form.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            })
            .catch(error => {
                console.error('Error downloading file:', error);
                alert('Error downloading file.');
            });
    })
});