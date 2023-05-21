import { Directive, ElementRef, Renderer2, HostListener, ChangeDetectorRef, OnInit, EventEmitter, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import $ from 'jquery';
import { RegexService } from '../services/regex.service';
import * as KeyCodes from '@angular/cdk/keycodes';
@Directive({
    selector: '[validate]'
})
export class ValidateDirective implements OnInit {
    windowBlur: boolean = true;
    @Output('success') successFun: EventEmitter<any> = new EventEmitter();
    constructor(
        private ref: ChangeDetectorRef,
        public translate: TranslateService,
        private elementRef: ElementRef,
        private renderer: Renderer2,
        public regexService: RegexService
    ) {
    }
    @HostListener('window:focus', ['$event.target'])
    onFocus(target) {
        this.windowBlur = false;
    }


    @HostListener('window:focusout', ['$event.target'])
    onFocusout(target) {
        this.windowBlur = true;
    }

    @HostListener('focus', ['$event.target'])
    elemntonFocus(target1) {
        const target = $(target1);
        target.closest('.control-group').removeClass('has-error');
        target.closest('.control-group').find('.has-error').remove();
        target.parent('.ds-validate').removeClass('ds-validate--has-error');
        target.parent('.ds-validate').find('.has-error').remove();
        target.find('state-error').remove();
        target.removeClass('state-error');
        target.removeClass('state-success');
        target.find('state-success').remove();
    }


    @HostListener('focusout', ['$event.target'])
    elemntonFocusout(target1) {
        const target = $(target1);
        target.parent('.ds-validate').removeClass('ds-validate--has-error');
        target.parent('.ds-validate').find('.has-error').remove();
    }
    @HostListener('blur', ['$event.target'])
    elemntonBlur(target) {
        this.checkForm(target, 0);
    }
    @HostListener('focusin', ['$event.target'])
    elemntonFocusin(ev1) {
    }

    @HostListener('keydown', ['$event'])
    elementonkeypress($event) {
        const e = $event;
        const element = $($event.target);
        if (element.attr('inputspace')) {

            let altkeypress;
            if (e.altKey) {
                altkeypress = true;
            }
            else {
                if (altkeypress) {
                    altkeypress = false;
                    return false;
                }
            }
            if ((e.which >= 32 && e.which <= 36) || (e.which >= 41 && e.which <= 45) || (e.which === 47) || (e.key == '@' && e.which === 50) || (e.which >= 58 && e.which <= 64) || (e.which >= 91 && e.which <= 93) || (e.which >= 106 && e.which <= 188) || (e.which >= 190 && e.which <= 222)) {
                return false;
            }
        }
        if (element.attr('inputonlynumber')) {
            if ((e.which >= 32 && e.which <= 36) || (e.which >= 41 && e.which <= 47) || (e.which >= 58 && e.which <= 93) || (e.which >= 106 && e.which <= 222)) {
                return false;
            }
        }
        if (element.attr('inputmobilespacendash')) {
            if ((e.which >= 33 && e.which <= 34) || (e.which >= 41 && e.which <= 45) || (e.which === 47) || (e.which >= 58 && e.which <= 64) || (e.which >= 91 && e.which <= 93) || (e.which >= 106 && e.which <= 188) || (e.which >= 190 && e.which <= 222)) {
                return false;
            }
        }
        if (element.attr('validate-maxlength')) {
            const attr = element.attr('validate-maxlength');
            if (element.val().length + 1 > attr) {
                const customErrorMessgae = element.attr('error-message');
                element.closest('.control-group').find('.has-error').remove();
                if (customErrorMessgae) {
                    this.showError(customErrorMessgae, element, attr);
                } else {
                    this.showError('error_maxlength_chars', element, attr);
                }

            }
            else {
                this.showSuccess(element);
            }
        }
        if (element.attr('inputspacehypens')) {
            if (e.which === 32 || e.which === 189) {
                return false;
            }
        }
        if (element.attr('nospaceallow')) {
            if (e.which === 32) {
                return false;
            }
        }
    }

    ngOnInit() {
        this.renderer.listen(this.elementRef.nativeElement, 'focus', (event) => {
            const target = $(event.target);
            target.closest('.control-group').removeClass('has-error');
            target.closest('.control-group').find('.has-error').remove();
            target.parents('.ds-validate').removeClass('ds-validate--has-error');
            target.parents('.ds-validate').find('.has-error').remove();
            target.find('state-error').remove();
            target.removeClass('state-error');
            target.removeClass('state-success');
            target.find('state-success').remove();
        });
        const element = $(this.elementRef.nativeElement);
        if (element.attr('trigger-check')) {
            this.renderer.listen(this.elementRef.nativeElement, 'click', (ev) => {
                ev.preventDefault();
                // remove any visible errors
                $('.mat-form-field.has-error').removeClass('has-error');
                $('.mat-form-field').find('.has-error').remove();

                // grab all inputs set for validation minus the button triggering the check
                const inputs = $('input,mat-select,mat-checkbox').not('input[trigger-check]');

                // loop through inputs and send them through checkForm
                inputs.each((i, element) => {
                    this.checkForm(element, 0);
                });

                const errors = $('.mat-form-field.has-error');
                if (errors.length === 0) {
                    this.successFun.emit();
                    // this.ref.detectChanges(element);
                } else {
                    const target = $('.mat-form-field.has-error')[0];
                    $('html, body').animate({
                        scrollTop: $(target).offset().top - 100
                    }, 1000); // animate scroll to first error
                }
            });
        }
        if (element.attr('triggerWithoutScroll')) {
            element.click((ev) => {
                //  StopExecution = true;
                ev.preventDefault();
                // remove any visible errors
                $('.mat-form-field.has-error').removeClass('has-error');
                $('.mat-form-field').find('.has-error').remove();

                // this.ref.detectChanges(element.attr("pvCheck"));
                const sectiontype = element.attr('sectiontype');

                // grab all inputs set for validation minus the button triggering the check
                const inputs = $('[' + sectiontype + ']').not('input[trigger-checksection]');

                // loop through inputs and send them through checkForm
                inputs.each((i, element) => {
                    this.checkForm(element, 0);
                });

                const errors = $('.mat-form-field.has-error');
                if (errors.length === 0) {
                    this.successFun.emit();
                }
            });
        }
        if (element.attr('trigger-check-section')) {
            this.renderer.listen(this.elementRef.nativeElement, 'click', (ev) => {
                ev.preventDefault();
                // remove any visible errors
                $('.mat-form-field.has-error').removeClass('has-error');
                $('.mat-form-field').find('.has-error').remove();

                // this.ref.detectChanges(element.attr('pvCheck'));

                const sectiontype = element.attr('sectiontype');

                // grab all inputs set for validation minus the button triggering the check
                const inputs = $('[' + sectiontype + ']')
                    .not('button[trigger-check-section]')
                    .not('.novalidate');

                // loop through inputs and send them through checkForm
                inputs.each((i, element) => {
                    this.checkForm(element, 0);
                });

                // special pw check that happens only on btn click and if pw field exists
                if ($('#password1').length > 0) {
                    const pw1 = $('#password1');
                    const pw2 = $('#password2');
                    const ctrlGrps = pw1.closest('.controls-row').find('.mat-form-field');
                    if (pw1.val() !== pw2.val()) {
                        ctrlGrps.addClass('has-error');
                        $('.password-match')
                            .text('No Match')
                            .addClass('has-error');
                    }
                }

                const errors = $('.mat-form-field.has-error');
                if (errors.length === 0) {
                    this.successFun.emit();
                } else {
                    const target = $('.mat-form-field.has-error')[0];
                    const link = $(target);
                    const offset = link.offset();
                    const top = offset.top;
                    const bottom = $(window).height() - top - link.height();
                    $('html, body').animate(
                        {
                            scrollTop: bottom > 1 ? bottom : $(target).offset().top
                        },
                        1000
                    ); // animate scroll to first error
                }
            });
        }
        if (element.attr('triggerTabSection')) {
            element.click((ev) => {
                setTimeout(() => {
                    // StopExecution = true;
                    ev.preventDefault();
                    // remove any visible errors

                    const sections = $('div[trigger-tab-section=\'true\']').not('[currenttab=\'true\']');
                    sections.forEach((n, item) => {
                        const element1 = $(item);
                        // grab all inputs set for validation minus the button triggering the check
                        const inputs = element1.find(':input');

                        // loop through inputs and send them through checkForm
                        inputs.each((i, e) => {
                            const element = $(e);
                            element.closest('.mat-form-field').removeClass('has-error');
                            element.closest('.mat-form-field').find('.has-error').remove();

                            this.checkForm(element, 0);
                        });
                    });
                    // special pw check that happens only on btn click and if pw field exists
                    if ($('#password1').length > 0) {
                        const pw1 = $('#password1');
                        const pw2 = $('#password2');
                        const ctrlGrps = pw1.closest('.controls-row').find('.mat-form-field');
                        if (pw1.val() !== pw2.val()) {
                            ctrlGrps.addClass('has-error');
                            $('.password-match')
                                .text('No Match')
                                .addClass('has-error');
                        }
                    }
                }, 1000);


            });

        }
        return null;
    }

    checkForm(element1, type = 0) {
        const element = $(element1);
        let attr;
        let value = element.val();
        if (element1.localName === 'mat-select') {
            value = element1.textContent;
        }

        /*--attrs is not used because when the continue button is clicked attrs held the value of the button and not the element we passsed in - instead
        we check the old fashioned way with jQuery to see what validation needs to be done.--*/


        // not empty validation
        if (element.attr('noempty')) {
            if ($.trim(value) === '') {
                if (type === 0) {
                    element.closest('.mat-form-field').find('.has-error').remove();
                    this.showError('error_required_field', element);
                }
            }
            else {
                this.showSuccess(element);
            }
        }

        if (element.attr('validname')) {
            if (value.match(/[*^|":<>[\]{}\\()';?/~!,]/)) {
                if (type === 0) {
                    this.showError('error_special_char', element);
                }
            }
            else {
                this.showSuccess(element);
            }
        }

        if (element.attr('phoneno')) {
            if (!value.match(/^\d*$/)) {

                if (type === 0) {
                    this.showError('error_only_numbers', element);
                }

            }
        }
        // min length validation
        if (element.attr('minlength')) {
            attr = element.attr('minlength');
            if (value) {
                if (value.length < attr) {
                    if (type === 0) {
                        element.closest('.ds-validate').addClass('ds-field--is-dirty');
                        this.showError('error_minimum_chars', element, attr);

                    }
                }
                else {
                    this.showSuccess(element);
                }
            }
        }

        // max length validation
        if (element.attr('validate-maxlength')) {
            attr = element.attr('validate-maxlength');
            if (value.length > attr) {
                if (type === 0) {
                    const customErrorMessgae = element.attr('error-message');
                    if (customErrorMessgae) {
                        this.showError(customErrorMessgae, element, attr);
                    } else {
                        this.showError('error_maxlength_chars', element, attr);
                    }
                }

            }
            else {
                this.showSuccess(element);
            }
        }
        // email validation
        if (element.attr('email') && element.attr('email') == 'true') {

            if (value) {
                this.validateEmail(value, element);
            }
        }


        // alphanumeric validation
        if (element.attr('alphanumericdash')) {
            if (value) {
                this.validateAlphaNumericDash(value, type);
            }
        }



        if (element.attr('password-match')) {
            const currentPw = $('#txtPassword').val();
            if (element.val()) {
                if (currentPw == element.val()) {
                    this.showSuccess(element);
                } else {
                    if (type === 0) {
                        element.closest('.mat-form-field').find('.has-error').remove();
                        this.showError('password_not_match', element, attr);
                    }
                }
            }
        }
        // no spaces
        if (element.attr('nospaces')) {
            if (value.match(/\s/g)) {
                if (type === 0) {
                    element.closest('.mat-form-field').find('.has-error').remove();
                    this.showError('error_spaces_not_permitted', element);
                }
            }
            else {
                this.showSuccess(element);
            }
        }
        // select validation
        if (element.attr('validate-select')) {
            value = element1.textContent.replace(/\s/g, '');

            if ((value && value.match(/Select a/)) || !value || value == ' ' || value == '') {
                if (type === 0) {
                    this.showError('error_make_selection', element);
                }
            }
            else {
                this.showSuccess(element);
            }
        }

        // select validation
        if (element.attr('validate-custom-select')) {
            value = $('#freq_dd').val();

            if (value === '') {
                if (type === 0) {
                    this.showError('error_make_selection', element);
                }
                // else {
                //     formcompletecheck = false;
                // }
            }
            else {
                this.showSuccess(element);
            }
        }

        // checkbox validation
        if (element.attr('checkbox-validate')) {
            element.on('click', (event) => {
                const target = $(event.target);
                if ($(event.target).find('input[class="mat-checkbox-input"]')) {
                    target.closest('.control-group').removeClass('has-error');
                    target.closest('.control-group').find('.has-error').remove();
                    target.parents('.ds-validate').removeClass('ds-validate--has-error');
                    target.parents('.ds-validate').find('.has-error').remove();
                    target.find('state-error').remove();
                    target.removeClass('state-error');
                    target.removeClass('state-success');
                    target.find('state-success').remove();
                }
            });
            if (element.find('input').attr('aria-checked') == 'false' || !element.find('input').attr('aria-checked')) {
                if (type === 0) {
                    this.showError('checkbox_required', element);
                }

            }
            else {
                this.showSuccess(element);
            }
        }
        // checkbox validation
        if (element.attr('checkbox-validate-autoship')) {

            if ((element.find('input').attr('aria-checked') == 'false' || !element.find('input').attr('aria-checked')) && element.hasClass('ischeck')) {
                if (type === 0) {
                    this.showError('autoship_required', element.parent().parent());
                }

            }
            else {
                this.showSuccess(element);
            }
        }

        // regex validation
        if (element.attr('regxvalid')) {
            if (value) {
                this.regexValidate(value, element, element.attr('regxvalidValue'), type);
            }

        }


        // regex validation
        if (element.attr('regxvalidzip')) {
            if (value) {
                this.regexValidateZip(element, value, element.attr('regexcountry').toUpperCase());
            }
        }


        // greater than zero
        if (element.attr('greater-than-zero')) {
            if (value) {
                const numb = value.replace(/[^0-9]/g, '');
                if (numb > 0) {
                    this.showSuccess(element);
                } else {
                    if (type === 0) {
                        this.showError('greater_then_zero', element, attr);
                    }
                }
            }
        }

    }
    validateEmail(value, element, type = 0) {
        const filter = new RegExp('^([\\w-\\.+]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([\\w-]+\\.)+))([a-zA-Z]{2,10}|[0-9]{1,3})(\\]?)$');
        if (filter.test(value)) {
            this.showSuccess(element);
        }
        else {
            if (type === 0) {
                this.showError('error_valid_email', element);
            }
        }
    }
    validateAlphaNumericDash(value, element, type = 0) {
        const filter = new RegExp('^[a-zA-Z0-9-.]+$');
        if (filter.test(value)) {
            this.showSuccess(element);
        } else {
            if (type === 0) {
                this.showError('error_valid_alphanumeric', element);
            }
        }
    }
    regexValidate(value, element, regxExp, type = 0) {
        const filter = new RegExp(regxExp);
        if (filter.test(value)) {
            this.showSuccess(element);
        }
        else {
            if (type === 0) {
                element.closest('.mat-form-field').find('.has-error').remove();
                this.showError('INVALID_PASSWORD_FORMAT', element);
            }
        }
    }
    regexValidateZip(element, value, countrycode, type = 0) {
        const regxExp = this.regexService.getRegex(countrycode);
        const filter = new RegExp(regxExp);
        if (filter.test(value)) {
            this.showSuccess(element);
        }
        else {
            if (type === 0) {
                this.showError('INVALID ZIP', element);
            }
        }
    }

    showError(msg, element, val?: '') {
        // let element=$(element.parent());
        if (!element.hasClass('novalidate')) {
            if (!element.closest('.mat-form-field').find('span').hasClass('has-error')) {
                // create and display error message
                element.removeClass('state-success');
                element.addClass('state-error');
                const container = $('<small />');

                if (element.attr('custommsg')) {
                    msg = element.attr('custommsg');
                }

                msg = this.translate.instant(msg, { value: val });
                container.text(msg).addClass('has-error help-block ng-scope').attr('translate', '');
                element.parent().closest('.ds-validate').addClass('ds-validate--has-error');
                element.parent().closest('.custom-validate').addClass('custom-validate--has-error');

                if (element.hasClass('ds-checkbox') || element.hasClass('ds-radio')) {
                    element.after(container);
                }
                if (element.parentsUntil().hasClass('ds-validate--has-error')) {
                    element.after(container);
                }
                if (element.parentsUntil().hasClass('custom-validate--has-error')) {
                    element.after(container);
                }
                element.closest('.mat-form-field').addClass('has-error');
            }

        }
    }
    showSuccess(element) {
        if (!element.hasClass('novalidate') && !this.windowBlur) {
            if (!element.closest('.mat-form-field').find('span').hasClass('has-error')) {
                // create and display error message
                element.removeClass('state-error');
                element.addClass('state-success');
            }
        }
    }
}

