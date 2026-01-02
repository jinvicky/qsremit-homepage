$(document).ready(function () {
    let isInitialized = false; // 실행 방지 플래그
    const pathSegments = window.location.pathname.split('/');
    const transactionId = pathSegments[pathSegments.length - 1];

    const depositTable = $('#txnDepositHistorySearchTable').DataTable({
        dom: 'lrtip',
        info: false,
        paging: false,
        ordering: false,
        columns: [
            {
                data: null,
                defaultContent: '',
                className: 'select-checkbox text-center',
                orderable: false
            },
            {
                data: 'id',
                visible: false,
                searchable: false
            },
            {
                data: 'depositDate',
                className: 'text-center',
                defaultContent: "",
                render: function (data, type, row) {
                    const formatted = data ? moment(data).format('YYYY.MM.DD') : '';
                    return `<div class="text-center">${formatted}</div>`;
                }
            },
            {
                data: 'bank',
                className: 'text-center',
                defaultContent: "",
            },
            {
                data: 'depositAmount', // 4
                className: 'text-center',
                defaultContent: "",
                render: function(data) { return format(data); }
            },
            {
                data: 'accountHolder',
                className: 'text-center',
                defaultContent: ""
            },
        ],
        columnDefs: [
            {
                targets: 0,
                className: 'select-checkbox',
                orderable: false
            }
        ],
        select: {
            style: 'multi',
            selector: 'td:first-child'
        },
        serverSide: false,
    });
    const fetchLogData = (startDate, endDate, type, keyword, amount) => {
        $.ajax({
            url: `/transaction/bankDeposit/${transactionId}`, // 변경
            type: "GET",
            data: {
                startDate: startDate,
                endDate: endDate,
                type: type,
                keyword: keyword,
                amount: amount,
            },
            success: function (data) {
                depositTable.clear();
                depositTable.rows.add(data);
                depositTable.draw();

                $("#startDate").datepicker('update', startDate);
                $("#endDate").datepicker('update', endDate);
                $("#searchText").val(keyword);
                $("#depositAmount").val((amount && !isNaN(amount) && amount !== 0) ? format(amount) : "");
                $("#userEvent").val(type);
            },
            error: function (xhr, error, thrown) {
                console.error("Error:", error);
                alert("An error occurred while fetching the data.");
            }
        })
    }

    $("#search-btn").on("click", function () {
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();
        const type = $('#userEvent').val();
        const keyword = $("#searchText").val();
        const depositAmount = $("#depositAmount").val().replace(/[^0-9]/g, "");

        fetchLogData(startDate, endDate, type, keyword, depositAmount);
    })
    $(document).on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#search-btn").trigger("click");
        }
    });

    $(document).ajaxComplete(function (event, xhr, settings) {
        const depositMethod = $('#transferAgency').text().trim().toUpperCase();
        const status = $('#transactionStatus span').text().trim();

        if (depositMethod && status === 'Waiting For Deposit') {
            if (isInitialized) return;

            isInitialized = true;

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0]

            if ($.fn.DataTable.isDataTable('#txnDepositHistorySenderTable')) {
                $('#txnDepositHistorySenderTable').DataTable().destroy();
            }

            $('#txnDepositHistorySenderTable').DataTable({
                dom: 'lrtip',
                info: false,
                paging: false,
                ordering: false,
                ajax: {
                    url: `/transaction/bankDeposit/sender/${transactionId}`,
                    dataSrc: function (json) {
                        return [json];
                    },
                    error: function (xhr, error, thrown) {
                        console.error("Failed to load data:", thrown);
                        alert("Failed to load sender info. Please try again later.");
                    }
                },
                columns: [
                    {
                        data: 'txnID',
                        className: 'text-center',
                        defaultContent: "",
                    },
                    {
                        data: 'txnDate',
                        className: 'text-center',
                        defaultContent: "",
                        render: function (data, type, row) {
                            const formatted = data ? moment(data).format('YYYY.MM.DD HH:mm:ss') : '';
                            return `<div class="text-center">${formatted}</div>`;
                        }
                    },
                    {
                        data: 'senderName',
                        orderable: false,
                        className: 'text-center',
                        defaultContent: "",
                        render: function (data, type, row) {
                            if (!data) return '';
                            const customerId = row.customerId || ''; // 없을 경우 대비
                            const optionalName = row.optionalNames ? '/'+row.optionalNames : '';

                            return `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <span class="text-truncate" style="max-width: 100px;" title="${data}">${data}</span>
                        <small class="text-muted">(${customerId}${optionalName})</small>
                    </div>
                `;
                        }
                    },
                    {
                        data: 'paymentCountryPartner',
                        className: 'text-center',
                        defaultContent: ""
                    },
                    {
                        data: 'collectedAmount',
                        className: 'text-center',
                        defaultContent: "",
                        render: function(data) { return format(data); }
                    },
                ],
                columnDefs: [
                    {
                        targets: 0,
                        width: '100px'
                    }
                ],
                serverSide: false,
            });

            /**
             * depositAmount에 collectedAmount 기본값으로 로드 시 바로 검색이 진행됩니다.
             */
            $('#txnDepositHistorySenderTable').on('xhr.dt', function (e, settings, json, xhr) {
                if (json && json.collectedAmount != null) {
                    const collectedAmount = json.collectedAmount.toString();
                    const depositMethod = $('#depositMethodSelect').val().trim().toUpperCase();

                    fetchLogData(formattedDate, formattedDate, "depositBank", depositMethod, collectedAmount);
                }
            });
        }
    });

    function format(data) {
        if (data === null || data === 0) {
            return 0;
        }
        return Number(data).toLocaleString(); // 숫자를 3자리 단위로 반점 표시
    }

});
