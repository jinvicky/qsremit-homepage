// ------------------------------
// Helper 함수들
// ------------------------------

// AutoNumeric 초기화 함수
function initAutoNumeric(selector, options) {
    return $(selector).length ? new AutoNumeric(selector, options) : null;
}

// 숫자에 콤마 표기
function formatNumberWithCommas(value) {
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

function formatNumberWithCommasCurrency(value, currency) {
    if (value === null || value === undefined) return "";

    const num = Number(value);
    if (num === 0) return `0 ${currency}`;

    const formattedNum = num
        .toFixed(10) // 소수점 이하 10자리까지 표시
        .replace(/\.?0+$/, ""); // 불필요한 0 제거

    // 정수와 소수 부분 분리
    const [integerPart, decimalPart] = formattedNum.split(".");

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart ? `${formattedInteger}.${decimalPart} ${currency}` : `${formattedInteger} ${currency}`;
}

// SelectBox 초기화 함수
function SelectBox(selector, options, input, placeholder = 'Select') {
    $(selector).empty().append(`<option value="">${placeholder}</option>`);
    options.forEach(function (option) {
        $(selector).append(`<option ${$(input).val() === option ? 'selected' : ''} value="${option}">${option}</option>`);
    });
}

// SelectBox 초기화 함수 - value, option text 분리 사용
function SelectBoxByMap(selector, options, input, placeholder = 'Select') {
    $(selector).empty().append(`<option value="">${placeholder}</option>`);
    options.forEach(function (option) {
        $(selector).append(`<option ${$(input).val() === option.id ? 'selected' : ''} value="${option.id}">${option.name}</option>`);
    });
}

function SelectBoxByText(selector, options, input, placeholder = 'Select') {
    $(selector).empty().append(`<option value="">${placeholder}</option>`);
    options.forEach(function (option) {
        $(selector).append(`<option ${$(input).val() === option.name ? 'selected' : ''} value="${option.name}">${option.name}</option>`);
    });
}

function SelectBoxByEnglish(selector, options, input, placeholder = 'Select') {
    $(selector).empty().append(`<option value="">${placeholder}</option>`);
    options.forEach(function (option) {
        $(selector).append(`<option ${$(input).val() == option.id ? 'selected' : ''} value="${option.id}">${option.english}</option>`);
    });
}

/**
 * 파트너사에 따른 Basic Transaction Information 리스트 변경
 */
const setBasicTransactionInformation = (partnerType, purposeOfRemittances, relationToBeneficiaries, sourceOfIncomes) => {
    const optionalPartnerType = ['SEND_MN', 'TRANGLO'];
    const hasPartnerType = optionalPartnerType.includes(partnerType);

    const filteredPurposeOfRemittances = partnerType ? filterObject(purposeOfRemittances, "partnerType", (hasPartnerType || partnerType === 'GME') ? partnerType : null) : [];
    const filteredRelationToBeneficiaries = partnerType ? filterObject(relationToBeneficiaries, "partnerType", hasPartnerType ? partnerType : null) : [];
    const filteredSourceOfIncomes = partnerType ? filterObject(sourceOfIncomes, "partnerType", hasPartnerType ? partnerType : null) : [];

    SelectBoxByMap("#transactionReason", filteredPurposeOfRemittances, "#transactionReasonInput");
    SelectBoxByMap("#relation", filteredRelationToBeneficiaries, "#relationInput");
    SelectBoxByMap("#incomeSource", filteredSourceOfIncomes, "#incomeSourceInput");
    SelectBoxByText("#purposeOfRemittance", filteredPurposeOfRemittances, "#purposeOfRemittanceInput");
    SelectBoxByText("#sourceOfIncome", filteredSourceOfIncomes, "#sourceOfIncomeInput");
    SelectBoxByText("#relToBeneficiary", filteredRelationToBeneficiaries, "#relToBeneficiaryInput");
    // new customer
    SelectBoxByEnglish("#transactionReasonSelect", filteredPurposeOfRemittances, "#transactionReason");
    SelectBoxByEnglish("#relationSelect", filteredRelationToBeneficiaries, "#relation");
    SelectBoxByEnglish("#incomeSourceSelect", filteredSourceOfIncomes, "#incomeSource");
}
const filterObject = (sourceObject, filterKey, filterValue) => {
    return Object.entries(sourceObject || {})
        .filter(([_, data]) => data[filterKey] === filterValue)
        .reduce((filtered, [code, data]) => {
            filtered[code] = data;
            return filtered;
        }, []);
};

/* ------------------------ */

// Tranglo 전용 초기화 함수
function TrangloSelectBox(selector, options, input) {
    const source = ['11', '23', '7', '1', '2', '18', '3'];
    const rel = ['4', '9', '2', '5', '11', '16', '8', '5', '5', '3', '6', '1', '5'];

    $(selector).empty().append('<option value="">Select</option>');

    if (selector === '#sourceOfIncome') {
        options.forEach(function (option, id) {
            $(selector).append(`<option ${$(input).val() === option ? 'selected' : ''} value="${source[id]}">${option}</option>`);
        });
    }
    if (selector === '#relToBeneficiary') {
        options.forEach(function (option, id) {
            $(selector).append(`<option ${$(input).val() === option ? 'selected' : ''} value="${rel[id]}">${option}</option>`);
        });
    }
}