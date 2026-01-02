$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

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

    const balanceTable = $("#balanceTable").DataTable({
        rowId: "id",
        columns: [
            { data: null, title: "No.", width: "3%" },
            { data: "partnerUniqueId", title: "ID"},
            { data: "partnerCountry", title: "Country"},
            { data: "partnerName", title: "Partner"},
            { data: "balanceType", title: "Type"},
            {
                data: "balance",
                title: "Balance",
                render: function (data, type, row) {
                    if (row.apiSupported) {
                        return AutoNumeric.format(data, {
                            digitGroupSeparator: ",",
                            decimalPlaces: 2
                        });
                    } else {
                        return '-';
                    }
                }
            },

            // { data: null, title: "History", width: "10%",
            //     render: function (data, type, row) {
            //         return '<button class=\'history-button btn btn-primary waves-effect waves-light btn-detail\' style="width: 80px">History</button>';
            //     }
            // },
            { data: 'updatedAt', visible: false },
        ],
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        columnDefs: [
            { targets: [0, 1, 4, 6], className: "dt-head-center dt-body-center" },
        ],
        layout: {
            topEnd: {
                buttons: [
                    {
                        text: 'Reload',
                        action: function () {
                            const searchType = $("#countryPartnerSelect").val();
                            const type = $("#typeSelect").val();
                            if (searchType === "Country") {
                                fetchLogData("Country", $("#countrySelect").val(), type);
                            } else if (searchType === "Partner") {
                                fetchLogData("Partner", $("#partnerSelect").val(), type);
                            }
                        },
                        className: 'btn btn-soft-secondary'
                    },
                ],
            }
        },
        pageLength: 50,
        sorting: false,
        searching: false,
        initComplete: function () {
            $('.dt-button').removeClass('dt-button');
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        },
        rowCallback: function(row, data, index) {
            const pageInfo = this.api().page.info();
            const normalIndex = (pageInfo.page * pageInfo.length) + index + 1;
            $('td:eq(0)', row).html(normalIndex);
        }
    });

    function lastUpdateDate() {
        $.ajax({
            url : "/systemManagement/apiSchedule/balance",
            type : "GET",
            dataType: "json",
            success : function(response) {
                const offsetDate = new Date(response.lastUpdate);

                const formattedDate = `${offsetDate.getFullYear()}-${(offsetDate.getMonth()+1).toString().padStart(2,'0')}-${offsetDate.getDate().toString().padStart(2,'0')} `
                    + `${offsetDate.getHours().toString().padStart(2,'0')}:${offsetDate.getMinutes().toString().padStart(2,'0')}:${offsetDate.getSeconds().toString().padStart(2,'0')}`;

                $("#last-updated-date").text(formattedDate);
            },
            error : function(xhr, status, error) {
                console.log("Error Message:", error);
                $("#last-updated-date").text("Error loading date");
            }
        });
    }

    function loadOptions() {
        lastUpdateDate();
        $.ajax({
            type: "GET",
            url: "/transaction/transactionOutboundHistory/options",
            success: function (response) {
                // Payout Country/Partner
                const countries = (response.payoutCountry || []).sort((a, b) =>
                    a.localeCompare(b, 'ko')
                );
                const countrySelect = $("#countrySelect");
                countrySelect.empty().append('<option value="">Country All</option>');
                countries.forEach(function (country) {
                    countrySelect.append(`<option value="${country}">${country}</option>`);
                });

                const partners = (response.type || []).sort((a, b) =>
                    a.localeCompare(b, 'ko')
                );
                const partnerSelect = $("#partnerSelect");
                partnerSelect.empty().append('<option value="">Partner All</option>');
                partners.forEach(function (partner) {
                    partnerSelect.append(`<option value="${partner}">${partner}</option>`);
                });
            },
            error: function (error) {
                console.error("Error fetching options:", error);
                alert("Failed to fetch option data.");
            }
        });
    }
    loadOptions();

    $("#countryPartnerSelect").change(function () {
        const selectedValue = $(this).val();
        if (selectedValue === "Country") {
            $("#countrySelect").show();
            $("#partnerSelect").hide();
            $("#partnerSelect").val("");
        } else if (selectedValue === "Partner") {
            $("#countrySelect").hide();
            $("#partnerSelect").show();
            $("#countrySelect").val("");
        }
    });

    function fetchLogData(searchType, searchKeyword, type) {
        $.ajax({
            url: "/partnerManagement/", // 변경
            type: "GET",
            data: {
                type: type,
                searchType: searchType,
                searchKeyword: searchKeyword
            },
            success: function (data) {
                console.log(data)
                balanceTable.clear();
                balanceTable.rows.add(data);
                balanceTable.draw();

                $("#countryPartnerSelect").val(searchType || "Country");
                if (searchType === "Country") {
                    $("#countrySelect").show();
                    $("#partnerSelect").hide();
                    $("#partnerSelect").val(searchKeyword);
                } else if (searchType === "Partner") {
                    $("#countrySelect").hide();
                    $("#partnerSelect").show();
                    $("#countrySelect").val(searchKeyword);
                }
            },
            error: function (xhr, error) {
                console.error("Error:", error);
                alert("An error occurred while fetching the data.");
            }
        })
    }

    fetchLogData();

    $("#search-btn").on("click", function () {
        const searchType = $("#countryPartnerSelect").val();
        const type = $("#typeSelect").val();
        if (searchType === "Country") {
            fetchLogData("Country", $("#countrySelect").val(), type);
        } else if (searchType === "Partner") {
            fetchLogData("Partner", $("#partnerSelect").val(), type);
        }
    })
    $(document).on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#search-btn").trigger("click");
        }
    });

    balanceTable.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        balanceTable.page.len(pageLength);
    }, 0);

});