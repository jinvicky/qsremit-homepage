$(document).ready(function () {
    /**
     * csrf token
     * */
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

    const allowedIPEditor = new DataTable.Editor({
        table: "#allowedIPTable",
        idSrc: "id",
        fields: [
            {label: "IP Address <span class=\"text-danger\">*</span>", name: "ipAddress"},
            {label: "Memo", name: "description"},
            {label: "Activation Start", name: "validFrom", type: "datetime", format: "YYYY-MM-DD"},
            {label: "Activation End", name: "validTo", type: "datetime", format: "YYYY-MM-DD"},
        ],
        ajax: {
            create: {
                type: "POST",
                url: "/allowedIps/create",
                data: function (data) {
                    const ipData = Object.values(data.data)[0];
                    return JSON.stringify(validateDate(ipData));
                },
                success: function (response) {
                    alert(response.message);
                    allowedIPTable.ajax.reload();
                    allowedIPEditor.close();
                },
                error: function (response) {
                    alert(response.responseJSON.message);
                }
            },
            edit: {
                type: "PUT",
                url: `/allowedIps/update?id={id}`,
                data: function (data) {
                    const id = Number(Object.keys(data.data)[0]);

                    const originalData = allowedIPTable
                        .rows()
                        .data()
                        .toArray()
                        .find((row) => row.id === id);
                    const editedItem = Object.values(data.data)[0];
                    const fullUpdateData = {...originalData, ...editedItem};

                    return JSON.stringify(validateDate(fullUpdateData));
                },
                success: function (response) {
                    alert(response.message);
                    allowedIPTable.ajax.reload();
                },
                error: function (response) {
                    console.log("error", response);
                }
            },
        }
    })

    allowedIPEditor.on('preSubmit', function (e, o, action) {
        const fromField = this.field('validFrom');
        const toField = this.field('validTo');
        const ipAddress = this.field('ipAddress');
        const description = this.field('description');

        fromField.error('');
        toField.error('');
        ipAddress.error('');
        description.error('');

        if (action !== 'remove') {
            const fromVal = fromField.val();
            const toVal = toField.val();

            if (fromVal && toVal) {
                const from = moment(fromVal, moment.ISO_8601, true);
                const to = moment(toVal, moment.ISO_8601, true);

                if (!from.isValid()) {
                    fromField.error('Invalid start date format.');
                }
                if (!to.isValid()) {
                    toField.error('Invalid end date format.');
                }

                if (from.isValid() && to.isValid() && from.isAfter(to)) {
                    fromField.error('Start date cannot be later than end date.');
                    toField.error('End date cannot be earlier than start date.');
                }
            }

            if (!isValidIp(ipAddress.val())) {
                ipAddress.error("Please enter a valid IP address.");
            }

            if (isHtml(description.val())) {
                description.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
            }

            if (!ipAddress.isMultiValue()) {
                if (!ipAddress.val()) {
                    ipAddress.error('An IP Address must be given');
                }
            }

            if (this.inError()) {
                return false;
            }
        }
    });

    function validateDate(data) {
        if (data.validFrom !== null) {
            data.validFrom = moment(data.validFrom, moment.ISO_8601, true);
        }
        if (data.validTo !== null) {
            data.validTo = moment(data.validTo, moment.ISO_8601, true).endOf('day');
        }

        return data;
    }

    function isValidIp(ip) {
        // IPv4
        const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
        return ipv4Regex.test(ip.trim());
    }

    const UNLIMITED = "#D6EAF8"
    const SCHEDULED = "#FADADD"
    const EXPIRED = "rgb(251,164,164)"
    const ACTIVE = "#bce6c9"
    const allowedIPTable = $("#allowedIPTable").DataTable({
        ajax: {
            url: "/allowedIps/list",
            dataSrc: "",
        },
        ordering: false,
        columns: [
            { data: null, orderable: false, render: DataTable.render.select() },
            {
                data: null, title: "No.", width: "5%",
                className: "dt-head-center dt-body-center",
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                },
            },
            {data: 'ipAddress', title: "IP Address",},
            {data: 'description', title: "Memo",},
            {
                data: 'validFrom',
                title: "Activation Start",
                width: "15%",
                className: "dt-head-center dt-body-center",
                render: function (data, type, row) {
                    if (row.validFrom) {
                        return moment(row.validFrom).format('YYYY-MM-DD');
                    } else {
                        return '';
                    }
                }
            },
            {
                data: 'validTo',
                title: "Activation End",
                width: "15%",
                className: "dt-head-center dt-body-center",
                render: function (data, type, row) {
                    if (row.validTo) {
                        return moment(row.validTo).format('YYYY-MM-DD');
                    } else {
                        return '';
                    }
                }
            },
            {
                data: null,
                title: "Status",
                render: function (data, type, row) {
                    return handleStatus(row.validFrom, row.validTo)
                }
            },
            {data: 'id', visible: false},
        ],
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        sorting: false,
        searching: false,
        layout: {
            topEnd: {
                buttons: [
                    {
                        text: 'Delete',
                        action: function () {
                            deleteData();
                        },
                        className: 'btn btn-danger'
                    },
                    {
                        extend: "create",
                        text: "New Allowed IP",
                        editor: allowedIPEditor,
                        className: 'btn btn-outline-primary width-xl'
                    },
                ]
            }
        },
        select: {
            style: 'multi',
            selector: 'td:first-child'
        },
        initComplete: function () {
            $('.dt-button').removeClass('dt-button');
        },
        rowCallback: function (row, data) {

            const status = handleStatus(data.validFrom, data.validTo);
            const $statusCell = $("td:eq(6)", row);

            switch (status) {
                case "Unlimited":
                    $statusCell.css({"background-color": UNLIMITED});
                    break;
                case "Scheduled":
                    $statusCell.css({"background-color": SCHEDULED});
                    break;
                case "Expired":
                    $statusCell.css({"background-color": EXPIRED});
                    break;
                case "Active":
                    $statusCell.css({"background-color": ACTIVE});
                    break;
            }
        },
        createdRow: function (row) {
            const targetColumns = [2, 3, 4, 5];

            targetColumns.forEach((columnIndex) => {
                $(row).find(`td:eq(${columnIndex})`).css('background-color', '#fff4cc');
            });
        }
    });

    const statusList = [
        {color: UNLIMITED, title: 'Unlimited', description: 'No time limit – always available.'},
        {color: ACTIVE, title: 'Active', description: 'Currently available and in use.'},
        {color: SCHEDULED, title: 'Scheduled', description: 'Not started yet – will become active later.'},
        {color: EXPIRED, title: 'Expired', description: 'No longer available – the period has ended.'},
    ]

    const html = statusList.map(item => `
        <div class="list-group-item d-flex align-items-center">
            <p class="p-1 mb-0 me-1" style="background-color: ${item.color}; width: 10%">${item.title}</p>
            <em class="mb-0">${item.description}</em>
        </div>
    `).join('')

    $(".status-description").append(html)

    function handleStatus(validFrom, validTo) {
        const now = moment();
        const start = validFrom ? moment(validFrom) : null;
        const end = validTo ? moment(validTo) : null;
        if (!start && !end) {
            return 'Unlimited';
        } else if (start && now.isBefore(start)) {
            return 'Scheduled';
        } else if (end && now.isAfter(end)) {
            return 'Expired';
        } else {
            return 'Active';
        }
    }

    allowedIPTable.on('click', 'tbody td', function () {
        try {
            allowedIPEditor.inline(this);
        } catch (error) {
            console.error(error);
        }
    });
    function deleteData() {
        const selectedIds = allowedIPTable.rows({ selected: true }).data().toArray().map(row => row.id);

        if (selectedIds.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }

        $.ajax({
            method: 'DELETE',
            url: `/allowedIps/delete`,
            contentType: 'application/json',
            data: JSON.stringify({
                ids: selectedIds
            }),
            success: function () {
                alert("IP Address delete successfully.")
                allowedIPTable.ajax.reload();
            },
            error: function (xhr, status, error) {
                console.error("Error Message:", error);
                alert("Error occurred while deleting data. Please try again.");
            }
        });
    }

    allowedIPTable.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        allowedIPTable.page.len(pageLength);
    }, 0);
});