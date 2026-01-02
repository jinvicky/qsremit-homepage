$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    const table = new DataTable("#customerSearchTable", {
        searching: false,
        rowId: "customerId",
		order: [[0, 'desc']],
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        processing: true,
        serverSide: true,
        pageLength: 50,
        ajax: function (data, callback) {
            loadCustomers(data, callback)
        },
        columns:[
            { data: null, title: "No.", className: "dt-head-center dt-body-center" },
            { data: "customerId", title: "Customer ID" },
            { data: "registrationType", title: "Type",
              orderable: false,
              className: "text-center",
              render: function (data) {
                return data == "COMPANY" ? '<i class="ri-building-fill" style="font-size: 24px;"></i>': '<i class="ri-account-circle-fill" style="font-size: 24px;"></i>';
              }
            },
            { data: null,
                title: "Sender Name / Company Name",
                orderable: false,
                render: function (data, type, row) {
                    let senderName = "";
                    senderName += data.lastName ? data.lastName + " " : "";
                    senderName += data.middleName ? data.middleName + " " : "";
                    senderName += data.firstName ? data.firstName + " " : "";
                    if (data.optionalLastName || data.optionalMiddleName || data.optionalFirstName) {
                        senderName += "(";
                    }
                    senderName += data.optionalFirstName ? data.optionalFirstName : "";
                    senderName += data.optionalMiddleName ? " " + data.optionalMiddleName : "";
                    senderName += data.optionalLastName ? " " + data.optionalLastName : "";
                    if (data.optionalLastName || data.optionalMiddleName || data.optionalFirstName) {
                        senderName += ")";
                    }
                    return `<p class="m-0 text-truncate" style="width: 170px">${row.companyName ? row.companyName : senderName}</p>`;
                }
            },
            {
                data: "birth",
                title: "Birth(Date Of Incoporation)/ Nationality",
                render: function (data, type, row) {
                    return `
                        <p class="m-0">${ row.birth && row.birth !== "" ? moment(row.birth).format("YYYY-MM-DD") : "-" }</p>
                        <p class="m-0">${ row.nationality && row.nationality !== "" ? row.nationality : "-" }</p>
                    `;
                }
            },
            { data: "contact", title: "Phone Number / Email",
                render: function (data, type, row) {
                    return `
                        <p class="m-0 text-truncate">${ row.contact && row.contact !== "" ? row.contact : "-" }</p>
                        <p class="m-0 text-truncate" style="width: 250px">${ row.email && row.email !== "" ? row.email : "-"}</p>
                    `;
                }
            },
            { data: "kycStatus", title: "KYC Status/ Signup Source/ Register Agent",
                render: function (data, type, row) {
                    return `
                    ${convertStatus(row.kycStatus)}
                    <p class="m-0 text-truncate">${ row.signupSource && row.signupSource !== "" ? row.signupSource : "-" }</p>
                    <p class="m-0 text-truncate">${ row.registerAgent && row.registerAgent !== "" ? row.registerAgent : "-" }</p>
                    `;
                }
            },
            { data: "idCardImageVerified", title: "ID Image Verified",
                render: function (data) {
                    return data ? '<i class="ri-check-fill" style="font-size: 24px;"></i>': '<i class="ri-close-fill" style="font-size: 24px;"></i>';
                }
            },
            {
                data: "createAt",
                title: "Registration Date",
                render: function (data) {
                    if (data === "" || data === null) {
                        return "-"
                    }
                    return `<p class="m-0 text-truncate" style="width: 80px">${ data && data !== "" ? moment(data).format("YYYY-MM-DD") : "-" }</p>`;
                }
            },
            { data: "id", visible: false },
            {
                data: null,
                visible: false,
                render: function () {
                    return `
                <button class="btn btn-danger btn-sm">Delete</button>
            `;
                }
            }
        ],
        rowCallback: function(row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(0)', row).html(reverseIndex);
        },
        initComplete: function () {
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
            $('#customerSearchTable thead th').css('padding', '8px');
            $('#customerSearchTable thead th').css('font-size', '12px');
            $('#customerSearchTable td').css('padding', '7px');
        }
    });

    function convertStatus(status) {
        switch (status) {
            case 'NOT_VERIFIED':
                return '<span class="badge rounded-pill" style="background-color: #64748B; color: white;">NOT Verified</span>';
            case 'STARTED':
                return '<span class="badge rounded-pill" style="background-color: #3B82F6; color: white;">Started</span>';
            case 'FAILED':
                return '<span class="badge rounded-pill" style="background-color: #EF4444; color: white;">Failed</span>';
            case 'EXPIRED':
                return '<span class="badge rounded-pill" style="background-color: #9CA3AF; color: white;">Expired</span>';
            case 'COMPLETED':
                return '<span class="badge rounded-pill" style="background-color: #10B981; color: white;">Completed</span>';
            case 'CHECKING':
                return '<span class="badge rounded-pill" style="background-color: #FACC15; color: black;">Checking</span>';
            case 'READY':
                return '<span class="badge rounded-pill" style="background-color: #6366F1; color: white;">Ready</span>';
            case 'INVALID_ID_CARD':
                return '<span class="badge rounded-pill" style="background-color: #F43F5E; color: white;">Invalid Card</span>';
            case 'UPLOADING':
                return '<span class="badge rounded-pill" style="background-color: #0EA5E9; color: white;">Uploading</span>';
            case 'AML_BLOCK':
                return '<span class="badge rounded-pill" style="background-color: #F97316; color: white;">AMLBlock</span>';
            case 'ICC':
                return '<span class="badge rounded-pill" style="background-color: #14B8A6; color: white;">ICC</span>';
            default:
                return '';
        }
    }

    $('#allStatusCheck').on('click', function () {
        $('.searchStatus').prop('checked', this.checked);
    })
    $('.searchStatus').on('change', function () {
        const allChecked = $('.searchStatus').length === $(`${'.searchStatus'}:checked`).length;
        $('#allStatusCheck').prop('checked', allChecked);
    });

    function loadCustomers(data, callback) {
        const checkedStatuses = $(".searchStatus:checked").map(function() {
            return $(this).val();
        }).get();

        const registrationTypes = $(".searchRegistration:checked").map(function() {
            return $(this).val();
        }).get();

        const columnSelectValue = $("#column-select").val()
        const searchTextValue = $('#search-text').val().trim()

        $.ajax({
            url: "/customer/",
            type: "GET",
            data: {
                name: (columnSelectValue === 'name' && searchTextValue !== '') ? searchTextValue.toUpperCase() : undefined,
                customerId: (columnSelectValue === 'id' && searchTextValue !== '') ? searchTextValue.toUpperCase() : undefined,
                contact: (columnSelectValue === 'contact' && searchTextValue !== '') ? searchTextValue : undefined,
                email: (columnSelectValue === 'email' && searchTextValue !== '') ? searchTextValue : undefined,
                birth: (columnSelectValue === 'birth' && searchTextValue !== '') ? searchTextValue : undefined,
                snsId: (columnSelectValue === 'snsId' && searchTextValue !== '') ? searchTextValue : undefined,
                nationality: $('#nationalitySelect').val(),
                status: checkedStatuses,
                registrationType: registrationTypes,
                page: Math.floor(data.start / data.length),
                size: data.length
            },
            dataType: "json",
            success: function (response) {
                callback({
                    draw: data.draw,
                    recordsTotal: response.totalElements, // 전체 데이터 개수
                    recordsFiltered: response.totalElements, // 필터링된 데이터 개수
                    data: response.content // 실제 데이터
                });
            },
            error: function () {
                callback({
                    draw: data.draw,
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: []
                });
            }
        });
    }

    const $searchText = $("#search-text");
    $("#column-select").on("change", function () {
        if ($(this).val() === 'birth') {
            $searchText.attr("data-provide", "datepicker");
            $searchText.attr("data-date-format", "yyyy-mm-dd");
            $searchText.attr("data-date-autoclose", "true");
            $searchText.attr("pattern", "\d{4}-\d{2}-\d{2}");
            $searchText.attr("maxlength", "10");
            $("#calenderIcon").removeAttr("hidden");
            const today = new Date();
            today.setFullYear(today.getFullYear() - 18);
            const dateStr = today.toISOString().slice(0, 10);
            $searchText.val(dateStr);
        } else {
            $searchText.datepicker('destroy');
            $searchText.each(function () {
                $.each(this.attributes, function () {
                    if (this.name !== "id" && this.name !== "class" && this.name !== 'type') {
                        $(this.ownerElement).removeAttr(this.name);
                    }
                });
            });
            $searchText.attr("data-provide", "");
            $searchText.attr("placeholder", "Search");
            $("#calenderIcon").attr("hidden", true);
            $searchText.val("");
        }
    })

    $("#searchBtn").on("click", function () { table.ajax.reload(); })
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#searchBtn").trigger("click");
        }
    });

    table.on("click", "tbody tr", function (e) {
        const row = table.row($(this).closest("tr"));
        const rowData = row.data();
        window.location.href = `/customer/customerDetail/${rowData.customerId}/${rowData.registrationType}`
    });

    table.on("click", "tbody tr button", function (event) {
        event.stopPropagation();
        event.preventDefault();

        const row = table.row($(this).closest("tr"));
        const rowData = row.data();

        if (!rowData) return;

        if (confirm("Are you sure you want to delete this user?")) {
            $.ajax({
                url: `/customer/delete/${rowData.customerId}`,
                type: "DELETE",
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function(xhr){
                    xhr.setRequestHeader(header, token);
                },
                success: function (response) {
                    row.remove().draw();
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting Customer:", error); // 에러 로그 출력
                    alert("Failed to delete the customer. Please try again.");
                }
            });
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