"use strict";
// Class definition
var min_allievi;
var min_allievi_esistenti;
var max_allievi;
var max_allievi_esistenti;
var KTWizard1 = function () {
    // Base elements
    var wizardEl;
    var formEl;
    var wizard;
    // Private functions
    var initWizard = function () {
        // Initialize form wizard
        wizard = new KTWizard('kt_wizard_v1', {
            startStep: 1
        });

        // Validation before going to next page
        wizard.on('beforeNext', function (wizardObj) {
            if (wizard.currentStep === 1) {
                checkStep1(wizardObj);
            } else if (wizard.currentStep === 2) {
                checkStep2(wizardObj);
            } else if (wizard.currentStep === 3) {
                checkStep3(wizardObj);
            } else if (wizard.currentStep === 4) {
                checkStep4(wizardObj);
            }
        });

        wizard.on('change', function (wizardObj) {
            var step = getStep(wizard, wizardObj);
            if (step > 0) {
                wizard.goTo(step);
                wizard.goTo(step);/*fatto x2 perchè uno non va*/
            }
            if (wizard.currentStep === 2) {
                $('#allievisi').select2({//setta placeholder nella multiselect
                    placeholder: "Seleziona Allievi"
                });
                $('#allievino').select2({//setta placeholder nella multiselect
                    placeholder: "Seleziona Allievi"
                });
            }
            if (wizard.currentStep === 3) {
                $('#docenti').select2({//setta placeholder nella multiselect
                    placeholder: "Seleziona Docenti"
                });
            }
            setTimeout(function () {
                KTUtil.scrollTop();
            }, 300);
        });
    };

    var initSubmit = function () {
        var btn = formEl.find('[data-ktwizard-type="action-submit"]');
        btn.on('click', function (e) {
            showLoad('Attendi qualche secondo...');
            e.preventDefault();
            KTApp.progress(btn);
            formEl.ajaxSubmit({
                error: function () {
                    KTApp.unprogress(btn);
                    swal.close();
                    swalError('Errore', "Riprovare, se l'errore persiste richiedere assistenza");
                },
                success: function (resp) {
                    var json = JSON.parse(resp);
                    KTApp.unprogress(btn);
                    swal.close();
                    if (json.result) {
                        swalSuccessReload("Progetto Creato", "Progetto formativo creato con successo!");
                    } else {
                        swalError('Errore', "<h4>" + json.messagge + "</h4>");
                    }
                }
            });
        });
    };

    return {
        init: function () {
            wizardEl = KTUtil.get('kt_wizard_v1');
            formEl = $('#kt_form');
            initWizard();
            initSubmit();
        }
    };
}();

jQuery(document).ready(function () {
    KTWizard1.init();
});

function checkStep1(wizardObj) {
    var err = false;
    err = checkObblFieldsContent($('#step1')) ? true : err;
    if (err) {
        wizardObj.stop();  // don't go to the next step
        $('html, body').animate({scrollTop: $('body').offset().top}, 300);
        return false;
    }
    return true;
}

function checkStep2(wizardObj) {
    var nameall = "";
    var maxa;
    var mina;
    if ($("#nome_pf").val() === "1") {
        nameall = "allievino";
        maxa = max_allievi;
        mina = min_allievi;
    } else {
        maxa = max_allievi_esistenti;
        mina = min_allievi_esistenti;
        nameall = "allievisi";
    }

    var err = false;
    err = checkObblFieldsContent($('#step2')) ? true : err;
    if ($('#' + nameall).val().length < mina) {//chek num max e min allievi
        err = true;
        $('#' + nameall + '_div').removeClass("is-valid-select").addClass("is-invalid-select");
        fastSwalShow("<h3>Numero minimo di allievi ("+mina+") non raggiunto.</h3>", "wobble");
    } else if ($('#' + nameall).val().length > maxa) {
        err = true;
        $('#' + nameall + '_div').removeClass("is-valid-select").addClass("is-invalid-select");
        fastSwalShow("<h3>Numero massimo di allievi (" + maxa + ") superato.</h3>", "wobble");
    }

    //check codici ateco
    if ($("#nome_pf").val() === "2") {

        var startat = "";
        $('#allievisi option:selected').each(function () {
            var ateco = $(this).attr('ateco');
            if (startat === "") {
                startat = ateco.substring(0, 3);
            } else {
                if (startat !== ateco.substring(0, 3)) {
                    err = true;
                    $('#allievisi_div').removeClass("is-valid-select").addClass("is-invalid-select");
                    fastSwalShow("<h3>I codici ATECO degli allievi devono appartenere alla stessa divisione ATECO (le prime due cifre devono essere uguali).</h3>",
                    "wobble");
                }
            }
        });
    }


    if (err) {
        wizardObj.stop();
        $('html, body').animate({scrollTop: $('body').offset().top}, 300);
        return false;
    }
    return true;
}

function checkStep3(wizardObj) {
    var err = false;
    err = checkObblFieldsContent($('#step3')) ? true : err;

    $('#step3').find('input.obbligatory').each(function () {
        if (this.id.includes("docente")) {
            $("#" + this.id.split("_")[1] + "_teacher").attr("class", "form-control is-invalid");
        }
    });

    if (err) {
        wizardObj.stop();
        $('html, body').animate({scrollTop: $('body').offset().top}, 300);
        return false;
    }
    return true;
}

function checkStep4(wizardObj) {
    var err = false;
    err = !checkRequiredFileContent($('#step4')) ? true : err;

    if (err) {
        wizardObj.stop();
        $('html, body').animate({scrollTop: $('body').offset().top}, 300);
        return false;
    }
    return true;
}

function getStep(wizard, wizardObj) {
    if (wizard.currentStep === 3) {
        if (!checkStep2(wizardObj)) {
            return 2;
        }
    }
    if (wizard.currentStep === 4) {
        if (!checkStep2(wizardObj)) {
            return 2;
        }
        if (!checkStep3(wizardObj)) {
            return 3;
        }
    }
    if (wizard.currentStep === 5) {
        if (!checkStep2(wizardObj)) {
            return 2;
        }
        if (!checkStep3(wizardObj)) {
            return 3;
        }
        if (!checkStep4(wizardObj)) {
            return 4;
        }
    }
    return 0;
}

