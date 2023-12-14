/* mô tả: Cảnh báo khi nhập sai thông tin vào các ô
Khi blur ra ngoài mà chưa hoàn thiện thông tin
*/
function Validator(options) {
    // tạo object để lưu các rule
    var selectorRule = {} ;
    //get parent element
    function getParentElement(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    // hàm thực hiện in ra lỗi hoặc bỏ lỗi
    function validate(inputElement, rule) { 
        var errorMessage;
        var errorElement = getParentElement(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        var rules = selectorRule[rule.selector];
        // lặp qua từng rule để kiểm tra
        for (var i = 0; i < rules.length ; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);    
            }
            if (errorMessage)
            break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParentElement(inputElement, options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParentElement(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }
    var formElement = document.querySelector(options.form)
    
    if (formElement) {
        //bỏ đi hành vi mặc định khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;
            // validate toàn bộ input khi nhận submit
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                //TH submit với JS
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked');
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value)
                                break; 
                            case 'file':
                                values[input.name] = input.files;
                                break;       
                            default:
                                values[input.value] = input.value;
                        }        
                        values[input.name] = input.value
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                //TH submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }
        options.rules.forEach(function (rule) {
            // Lưu lại rule cho mỗi input
            if (Array.isArray(selectorRule[rule.selector])) {
                selectorRule[rule.selector].push(rule.test);
            }   
            else {
                selectorRule[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                // TH blur ra khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }
                // Xử lí khi đang nhập
                inputElement.oninput = function() {
                    var errorElement = getParentElement(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParentElement(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            }
        })
    }
}
// phương thức thực hiện check name
Validator.isRequired = function(selector, message) {
    return {
        selector: selector, 
        // Khi có lỗi trả ra message lỗi, không lỗi trả vể undefined
        test: function(value) {   
            return value ? undefined : message || 'Vui lòng nhập thông tin'
            // trim() loại bỏ dấu cách đầu hoặc cuối hoặc toàn dấu cách 
        }
    }
}
// phương thức thực hiện check email
Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        // Khi có lỗi trả ra message lỗi, không lỗi trả vể undefined
        test: function(value) {   
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
            // trim() loại bỏ dấu cách đầu hoặc cuối hoặc toàn dấu cách 
        }
    }
}

// chức năng check số lượng kí tự của password
Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập mật khẩu tối thiểu ${min} kí tự`
        }
    }
}

// chức năng check password trùng nhau
Validator.isConfirm = function (selector, password, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === password() ? undefined : message || 'Giá trị nhập vào chưa chính xác'
        }
    }
}