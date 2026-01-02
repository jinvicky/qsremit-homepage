$(document).ready(async function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    const currentPath = window.location.pathname;
    const isNewPage = currentPath.includes('new');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('depositId');

    let reasonMap = {};
    await getBankAndReason(reasonMap);

    const modalBtn = document.getElementById("bankDepositCustomerSearch");
    let modal = bootstrap.Modal.getInstance(modalBtn);

    if (!modal) {
        modal = new bootstrap.Modal(modalBtn);
    }

    if (modal) {
        $("#reasonSelectSearch").hide();
        $("#searchText").hide();

        $("#columnSelect").on("change", function () {
            if ($("#columnSelect").val() == "reason") {
                $("#reasonSelectSearch").show();
                $("#bankNameSelectSearch").hide();
                $("#searchText").hide();
                $("#searchText").val("");
            } else if ($("#columnSelect").val() == "bankName") {
                $("#bankNameSelectSearch").show();
                $("#reasonSelectSearch").hide();
                $("#searchText").hide();
                $("#searchText").val("");
            } else {
                $("#reasonSelectSearch").hide();
                $("#bankNameSelectSearch").hide();
                $("#searchText").show();
            }
        })

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

        /* ------- DataTable 초기화 -------- */
        const columns = [
            { title: "No.", data: "id", className: "dt-head-center dt-body-center" }, // 0
            { title: "Bank Name", data: "ecBankName" }, // 1
            { title: "Account No.", data: "ecAccountNo", className: "dt-head-left dt-body-left" }, // 2
            { title: "Holder name", data: "ecHolderName" }, // 3
            { title: "Reason", data: "ecReason" }, // 4
            { title: "Receiver", data: "ecReceiver" }, // 5
            { title: "Company Name", data: "ecCompanyName" }, // 6
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return `<button type="button" data-bs-dismiss="modal" class="btn btn-primary btn-sm btn-select">Select</button>`;
                }
            }, // 7
            { data: "createdAt", visible: false } // 8
        ];

        // Table 초기화
        const table = new DataTable("#customerSearchTable", {
            columns: columns,
            searching: true,
            order: [[8, "desc"]],
            serverSide: false,
            processing: true,
            paging: true,
            lengthMenu: [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, 'All']
            ],
            ajax: {
                url: '/pgManagement/ECCustomerManagement/active/list',
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
            createdRow: function(row, data, dataIndex) {
                if (data.ecStatus === "LOCKED") {
                    $(row).hide(); // LOCKED 상태인 행을 숨김
                }
            },
            rowCallback: function(row, data, index) {
                const pageInfo = this.api().page.info();
                const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
                $('td:eq(0)', row).html(reverseIndex);
            }
        });

        const fetchData = (searchType, searchText) => {
            if (searchType === "reason") {
                searchText = $("#reasonSelectSearch").val();
            } else if (searchType === "bankName") {
                searchText = $("#bankNameSelectSearch").val();
            }

            $.ajax({
                url: '/pgManagement/ECCustomerManagement/active/search',
                type: 'GET',
                data: {
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

        function onSearch() {
            const searchType = $("#columnSelect").val();
            const searchText = $("#searchText").val();

            fetchData(searchType, searchText);
        }

        // 검색 버튼 클릭 이벤트
        $("#searchBtn").on("click", onSearch);

        // Enter 키 이벤트
        $("#searchText").on("keypress", function(e) {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                onSearch();
            }
        });

        $('#customerSearchTable').on('click', '.btn-select', function() {
            // 클릭된 행의 데이터 가져오기
            const row = $(this).closest('tr');
            const customerId = table.row(row).data().id;

            $.ajax({
                url: `/pgManagement/ECCustomerDetail/${customerId}`,
                method: "GET",
                contentType: "application/json",
                success: function(data) {
                    const ecData = {
                        ecBankName: data.ecBankName,
                        ecAccountNo: data.ecAccountNo,
                        ecHolderName: data.ecHolderName,
                        ecType: data.ecType,
                        ecReason: data.ecReason,
                        ecReceiver: data.ecReceiver,
                        ecCompanyName: data.ecCompanyName,
                        ecCompanyAddress: data.ecCompanyAddress
                    }

                    // ajax를 통한 데이터 전송 - 페이지 별 분기 처리
                    if (isNewPage) {
                        $.ajax({
                            url: '/pgManagement/newBankDepositManagement',
                            method: 'GET',
                            xhrFields: {
                                withCredentials: true
                            },
                            beforeSend: function(xhr) {
                                xhr.setRequestHeader(header, token);
                            },
                            success: function() {
                                $('#bankName').val(unescapeSpecialCharacters(ecData.ecBankName));
                                $('#accountNo').val(unescapeSpecialCharacters(ecData.ecAccountNo));
                                $('#holderName').val(unescapeSpecialCharacters(ecData.ecHolderName));

                                // 라디오 버튼 설정
                                $('input[name="gmeType"]').val([ecData.ecType]);

                                $('#receiver').val(unescapeSpecialCharacters(ecData.ecReceiver));
                                $('#companyName').val(unescapeSpecialCharacters(ecData.ecCompanyName));
                                $('#companyAddress').val(unescapeSpecialCharacters(ecData.ecCompanyAddress));

                                // select 박스 설정
                                $('#reasonInput').val(unescapeSpecialCharacters(ecData.ecReason));
                                $('#reasonSelect').val(unescapeSpecialCharacters(ecData.ecReason)).prop('disabled', true)
                                    .css('display', 'block');
                            },
                            error: function(xhr, status, error) {
                                console.error('Error:', error);
                            }
                        });
                    } else {
                        $.ajax({
                            url: `/pgManagement/bankDepositDetail/${id}`,
                            method: 'GET',
                            xhrFields: {
                                withCredentials: true
                            },
                            beforeSend: function(xhr) {
                                xhr.setRequestHeader(header, token);
                            },
                            success: function() {
                                $('#bankName').val(unescapeSpecialCharacters(ecData.ecBankName));
                                $('#accountNo').val(unescapeSpecialCharacters(ecData.ecAccountNo));
                                $('#holderName').val(unescapeSpecialCharacters(ecData.ecHolderName));

                                // 라디오 버튼 설정
                                $('input[name="gmeType"]').val([ecData.ecType]);

                                $('#receiver').val(unescapeSpecialCharacters(ecData.ecReceiver));
                                $('#companyName').val(unescapeSpecialCharacters(ecData.ecCompanyName));
                                $('#address').val(unescapeSpecialCharacters(ecData.ecCompanyAddress));

                                // select 박스 설정
                                $('#reasonInput').val(unescapeSpecialCharacters(ecData.ecReason));
                                $('#reasonSelect').val(unescapeSpecialCharacters(ecData.ecReason)).prop('disabled', true)
                                    .css('display', 'block');
                            },
                            error: function(xhr, status, error) {
                                console.error('Error:', error);
                            }
                        });
                    }
                },
                error: function() {
                    console.log("Error");
                }
            })
        });
    }
});