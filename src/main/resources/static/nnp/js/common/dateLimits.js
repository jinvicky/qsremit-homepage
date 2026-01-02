$(document).ready(function () {
    if ($("#startDate").length && $("#endDate").length) {

        const { startDate, endDate } = getDate();
        $("#startDate").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true
        }).datepicker("setDate", startDate)

        $("#endDate").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true
        }).datepicker("setDate", endDate)

        $("#startDate").on("changeDate", function (e) {
            const changeDate = moment(e.date).format("YYYY-MM-DD");
            const { endDate } = getDate();

            if (endDate && changeDate > endDate) {
                alert("The start date cannot be later than the end date.");
                $("#startDate").datepicker("update", null);
            } else {
                $("#endDate").datepicker("setStartDate", changeDate);
            }
        })

        $("#endDate").on("changeDate", function (e) {
            const changeDate = moment(e.date).format("YYYY-MM-DD");
            const { startDate } = getDate();

            if (startDate && changeDate < startDate) {
                alert("The end date cannot be earlier than the start date.");
                $("#endDate").datepicker("update", null); // 종료 날짜 초기화
            } else {
                $("#startDate").datepicker("setEndDate", changeDate);
            }
        })

        function getDate() {
            const startDate = $("#startDate").val() ? moment($("#startDate").val()).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
            const endDate = $("#endDate").val() ? moment($("#endDate").val()).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
            return { startDate, endDate }
        }
    }

    $("div[id*='datepick'] input").each(function (e) {
        if ($(this).val()) {
            $(this).val(moment($(this).val()).format("YYYY-MM-DD"));
        } else if (!$(this).val() && $(this).attr("id") !== "customerBirth") {
            $(this).val(moment().format("YYYY-MM-DD"));
        }

    })

    $("div[id*='datepick'] input").on("input", function () {
        console.log("DATE PICKER",  $(this).val());
        const v = $(this).val().trim();

        // 8자리 숫자형 날짜인지 확인 (예: 20251112)
        if (/^\d{8}$/.test(v)) {
            const year = v.slice(0, 4);
            const month = v.slice(4, 6);
            const day = v.slice(6, 8);
            const parsed = `${year}-${month}-${day}`;

            // input 값 교체
            $(this).val(parsed);

            // flatpickr / datepicker 같은 위젯에도 적용 (flatpickr 예시)
            if (this._flatpickr) {
                this._flatpickr.setDate(parsed, true);
            }
        }

        // 6자리 (YYYYMM)
        if (/^\d{6}$/.test(v)) {
            const year = v.slice(0, 4);
            const month = v.slice(4, 6);
            const parsed = `${year}-${month}`;
            $(this).val(parsed);

            // flatpickr가 month-picker 형식이면 다음처럼 설정 가능
            if (this._flatpickr) this._flatpickr.setDate(`${year}-${month}-01`, true);
            return;
        }
    });

    const registrationType = $('input[name="customerRegistrationType"]:checked').val();

    if (registrationType == "INDIVIDUAL") {
        const adultAge = 18;
        const birth = $("#customerBirth").val();
        $("#customerBirth").datepicker({
            dateFormat: "yy-mm-dd",
            autoclose: true,
            maxDate: getBirthdateForAge(adultAge)
        }).on("changeDate", function (e) {
            let selectedDate = e.date;
            let maxDate = getBirthdateForAge(adultAge)
            if (selectedDate > maxDate) {
                alert(`Customer must be at least ${adultAge} years old to sign up.`);
                $("#customerBirth").datepicker("update", getBirthdateForAge(adultAge));
            }
        }).datepicker("setDate", birth);
    }

    function getBirthdateForAge(age) {
        const today = new Date();
        const birthDate = new Date(today);
        birthDate.setFullYear(today.getFullYear() - age);
        return new Date(birthDate.toISOString().split('T')[0]);
    }

    $("input").attr("autocomplete", "off");
});