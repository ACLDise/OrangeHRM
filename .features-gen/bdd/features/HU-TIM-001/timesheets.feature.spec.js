// Generated from: features\HU-TIM-001\timesheets.feature
import { test } from "playwright-bdd";

test.describe('Registro y envío de hojas de tiempo semanales', () => {

  test('Rechazar el registro de horas negativas', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-001'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
    await And('tiene acceso a la edición de su hoja de tiempo', null, { page }); 
    await And('existen un proyecto y una actividad válidos disponibles', null, { page }); 
    await When('intenta guardar -5 horas asociadas a un proyecto y actividad válidos', null, { page }); 
    await Then('el sistema debe rechazar el valor negativo', null, { page }); 
    await And('debe mostrar un mensaje de validación en el campo de horas', null, { page }); 
    await And('debe permanecer en la pantalla de edición de la hoja de tiempo', null, { page }); 
  });

  test.describe('Registrar valores válidos de horas en la hoja de tiempo', () => {

    test('Example #1', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-002'] }, async ({ Given, When, Then, And, page }) => { 
      await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
      await And('tiene acceso a la edición de su hoja de tiempo', null, { page }); 
      await And('existen un proyecto y una actividad válidos disponibles', null, { page }); 
      await When('registra 0 horas asociadas a un proyecto y actividad válidos', null, { page }); 
      await And('guarda la hoja de tiempo', null, { page }); 
      await Then('el sistema debe aceptar el valor registrado', null, { page }); 
      await And('no debe mostrar mensajes de validación en el campo de horas', null, { page }); 
    });

    test('Example #2', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-002'] }, async ({ Given, When, Then, And, page }) => { 
      await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
      await And('tiene acceso a la edición de su hoja de tiempo', null, { page }); 
      await And('existen un proyecto y una actividad válidos disponibles', null, { page }); 
      await When('registra 8 horas asociadas a un proyecto y actividad válidos', null, { page }); 
      await And('guarda la hoja de tiempo', null, { page }); 
      await Then('el sistema debe aceptar el valor registrado', null, { page }); 
      await And('no debe mostrar mensajes de validación en el campo de horas', null, { page }); 
    });

    test('Example #3', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-002'] }, async ({ Given, When, Then, And, page }) => { 
      await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
      await And('tiene acceso a la edición de su hoja de tiempo', null, { page }); 
      await And('existen un proyecto y una actividad válidos disponibles', null, { page }); 
      await When('registra 23 horas asociadas a un proyecto y actividad válidos', null, { page }); 
      await And('guarda la hoja de tiempo', null, { page }); 
      await Then('el sistema debe aceptar el valor registrado', null, { page }); 
      await And('no debe mostrar mensajes de validación en el campo de horas', null, { page }); 
    });

  });

  test('Rechazar el registro de horas superiores al límite permitido', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-003'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
    await And('tiene acceso a la edición de su hoja de tiempo', null, { page }); 
    await And('existen un proyecto y una actividad válidos disponibles', null, { page }); 
    await When('intenta guardar 25 horas asociadas a un proyecto y actividad válidos', null, { page }); 
    await Then('el sistema debe rechazar el valor ingresado', null, { page }); 
    await And('debe mostrar un mensaje de validación en el campo de horas', null, { page }); 
    await And('debe permanecer en la pantalla de edición de la hoja de tiempo', null, { page }); 
  });

  test('Rechazar el registro de horas sin proyecto ni actividad', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-006'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
    await And('tiene acceso a la edición de su hoja de tiempo', null, { page }); 
    await When('registra 8 horas sin seleccionar proyecto ni actividad', null, { page }); 
    await And('intenta guardar la hoja de tiempo', null, { page }); 
    await Then('el sistema debe impedir el guardado', null, { page }); 
    await And('debe indicar que el proyecto es obligatorio', null, { page }); 
    await And('debe permanecer en la pantalla de edición de la hoja de tiempo', null, { page }); 
  });

  test('Rechazar el registro de horas con proyecto y sin actividad', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-006'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
    await And('tiene acceso a la edición de su hoja de tiempo', null, { page }); 
    await And('existe un proyecto válido disponible'); 
    await When('selecciona un proyecto válido', null, { page }); 
    await And('registra 8 horas sin seleccionar una actividad', null, { page }); 
    await And('intenta guardar la hoja de tiempo', null, { page }); 
    await Then('el sistema debe impedir el guardado', null, { page }); 
    await And('debe indicar que la actividad es obligatoria', null, { page }); 
    await And('debe permanecer en la pantalla de edición de la hoja de tiempo', null, { page }); 
  });

  test('Registrar y enviar correctamente una hoja de tiempo semanal', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-007'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
    await And('tiene acceso a la edición de su hoja de tiempo', null, { page }); 
    await And('existen un proyecto y una actividad válidos disponibles', null, { page }); 
    await When('registra 8 horas asociadas a un proyecto y actividad válidos', null, { page }); 
    await And('guarda la hoja de tiempo', null, { page }); 
    await And('envía la hoja de tiempo para aprobación'); 
    await Then('el sistema debe aceptar el envío de la hoja de tiempo'); 
    await And('la hoja de tiempo debe quedar en estado Submitted'); 
  });

  test('Aprobar correctamente una hoja de tiempo enviada', { tag: ['@ui', '@time', '@regresion', '@CP-TIM-008'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('que el usuario está autenticado en OrangeHRM', null, { page }); 
    await And('existe una hoja de tiempo en estado Submitted disponible para aprobación'); 
    await When('aprueba la hoja de tiempo'); 
    await Then('el sistema debe aceptar la aprobación'); 
    await And('la hoja de tiempo debe quedar en estado Approved'); 
    await And('no debe permitir modificar las horas registradas'); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features\\HU-TIM-001\\timesheets.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":20,"tags":["@ui","@time","@regresion","@CP-TIM-001"],"steps":[{"pwStepLine":7,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":22,"keywordType":"Context","textWithKeyword":"And tiene acceso a la edición de su hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":23,"keywordType":"Context","textWithKeyword":"And existen un proyecto y una actividad válidos disponibles","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When intenta guardar -5 horas asociadas a un proyecto y actividad válidos","stepMatchArguments":[{"group":{"start":16,"value":"-5"},"parameterTypeName":"int"}]},{"pwStepLine":11,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe rechazar el valor negativo","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"And debe mostrar un mensaje de validación en el campo de horas","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"And debe permanecer en la pantalla de edición de la hoja de tiempo","stepMatchArguments":[]}]},
  {"pwTestLine":18,"pickleLine":48,"tags":["@ui","@time","@regresion","@CP-TIM-002"],"steps":[{"pwStepLine":19,"gherkinStepLine":36,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":37,"keywordType":"Context","textWithKeyword":"And tiene acceso a la edición de su hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":38,"keywordType":"Context","textWithKeyword":"And existen un proyecto y una actividad válidos disponibles","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When registra 0 horas asociadas a un proyecto y actividad válidos","stepMatchArguments":[{"group":{"start":9,"value":"0"},"parameterTypeName":"int"}]},{"pwStepLine":23,"gherkinStepLine":41,"keywordType":"Action","textWithKeyword":"And guarda la hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":43,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe aceptar el valor registrado","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"And no debe mostrar mensajes de validación en el campo de horas","stepMatchArguments":[]}]},
  {"pwTestLine":28,"pickleLine":49,"tags":["@ui","@time","@regresion","@CP-TIM-002"],"steps":[{"pwStepLine":29,"gherkinStepLine":36,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":37,"keywordType":"Context","textWithKeyword":"And tiene acceso a la edición de su hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":38,"keywordType":"Context","textWithKeyword":"And existen un proyecto y una actividad válidos disponibles","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When registra 8 horas asociadas a un proyecto y actividad válidos","stepMatchArguments":[{"group":{"start":9,"value":"8"},"parameterTypeName":"int"}]},{"pwStepLine":33,"gherkinStepLine":41,"keywordType":"Action","textWithKeyword":"And guarda la hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":43,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe aceptar el valor registrado","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"And no debe mostrar mensajes de validación en el campo de horas","stepMatchArguments":[]}]},
  {"pwTestLine":38,"pickleLine":50,"tags":["@ui","@time","@regresion","@CP-TIM-002"],"steps":[{"pwStepLine":39,"gherkinStepLine":36,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":37,"keywordType":"Context","textWithKeyword":"And tiene acceso a la edición de su hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":38,"keywordType":"Context","textWithKeyword":"And existen un proyecto y una actividad válidos disponibles","stepMatchArguments":[]},{"pwStepLine":42,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When registra 23 horas asociadas a un proyecto y actividad válidos","stepMatchArguments":[{"group":{"start":9,"value":"23"},"parameterTypeName":"int"}]},{"pwStepLine":43,"gherkinStepLine":41,"keywordType":"Action","textWithKeyword":"And guarda la hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":43,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe aceptar el valor registrado","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"And no debe mostrar mensajes de validación en el campo de horas","stepMatchArguments":[]}]},
  {"pwTestLine":50,"pickleLine":57,"tags":["@ui","@time","@regresion","@CP-TIM-003"],"steps":[{"pwStepLine":51,"gherkinStepLine":59,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":60,"keywordType":"Context","textWithKeyword":"And tiene acceso a la edición de su hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":61,"keywordType":"Context","textWithKeyword":"And existen un proyecto y una actividad válidos disponibles","stepMatchArguments":[]},{"pwStepLine":54,"gherkinStepLine":63,"keywordType":"Action","textWithKeyword":"When intenta guardar 25 horas asociadas a un proyecto y actividad válidos","stepMatchArguments":[{"group":{"start":16,"value":"25"},"parameterTypeName":"int"}]},{"pwStepLine":55,"gherkinStepLine":65,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe rechazar el valor ingresado","stepMatchArguments":[]},{"pwStepLine":56,"gherkinStepLine":66,"keywordType":"Outcome","textWithKeyword":"And debe mostrar un mensaje de validación en el campo de horas","stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":67,"keywordType":"Outcome","textWithKeyword":"And debe permanecer en la pantalla de edición de la hoja de tiempo","stepMatchArguments":[]}]},
  {"pwTestLine":60,"pickleLine":74,"tags":["@ui","@time","@regresion","@CP-TIM-006"],"steps":[{"pwStepLine":61,"gherkinStepLine":76,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":62,"gherkinStepLine":77,"keywordType":"Context","textWithKeyword":"And tiene acceso a la edición de su hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":79,"keywordType":"Action","textWithKeyword":"When registra 8 horas sin seleccionar proyecto ni actividad","stepMatchArguments":[]},{"pwStepLine":64,"gherkinStepLine":80,"keywordType":"Action","textWithKeyword":"And intenta guardar la hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":65,"gherkinStepLine":82,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe impedir el guardado","stepMatchArguments":[]},{"pwStepLine":66,"gherkinStepLine":83,"keywordType":"Outcome","textWithKeyword":"And debe indicar que el proyecto es obligatorio","stepMatchArguments":[]},{"pwStepLine":67,"gherkinStepLine":84,"keywordType":"Outcome","textWithKeyword":"And debe permanecer en la pantalla de edición de la hoja de tiempo","stepMatchArguments":[]}]},
  {"pwTestLine":70,"pickleLine":88,"tags":["@ui","@time","@regresion","@CP-TIM-006"],"steps":[{"pwStepLine":71,"gherkinStepLine":90,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":72,"gherkinStepLine":91,"keywordType":"Context","textWithKeyword":"And tiene acceso a la edición de su hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":73,"gherkinStepLine":92,"keywordType":"Context","textWithKeyword":"And existe un proyecto válido disponible","stepMatchArguments":[]},{"pwStepLine":74,"gherkinStepLine":94,"keywordType":"Action","textWithKeyword":"When selecciona un proyecto válido","stepMatchArguments":[]},{"pwStepLine":75,"gherkinStepLine":95,"keywordType":"Action","textWithKeyword":"And registra 8 horas sin seleccionar una actividad","stepMatchArguments":[]},{"pwStepLine":76,"gherkinStepLine":96,"keywordType":"Action","textWithKeyword":"And intenta guardar la hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":77,"gherkinStepLine":98,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe impedir el guardado","stepMatchArguments":[]},{"pwStepLine":78,"gherkinStepLine":99,"keywordType":"Outcome","textWithKeyword":"And debe indicar que la actividad es obligatoria","stepMatchArguments":[]},{"pwStepLine":79,"gherkinStepLine":100,"keywordType":"Outcome","textWithKeyword":"And debe permanecer en la pantalla de edición de la hoja de tiempo","stepMatchArguments":[]}]},
  {"pwTestLine":82,"pickleLine":107,"tags":["@ui","@time","@regresion","@CP-TIM-007"],"steps":[{"pwStepLine":83,"gherkinStepLine":109,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":84,"gherkinStepLine":110,"keywordType":"Context","textWithKeyword":"And tiene acceso a la edición de su hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":85,"gherkinStepLine":111,"keywordType":"Context","textWithKeyword":"And existen un proyecto y una actividad válidos disponibles","stepMatchArguments":[]},{"pwStepLine":86,"gherkinStepLine":113,"keywordType":"Action","textWithKeyword":"When registra 8 horas asociadas a un proyecto y actividad válidos","stepMatchArguments":[{"group":{"start":9,"value":"8"},"parameterTypeName":"int"}]},{"pwStepLine":87,"gherkinStepLine":114,"keywordType":"Action","textWithKeyword":"And guarda la hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":88,"gherkinStepLine":115,"keywordType":"Action","textWithKeyword":"And envía la hoja de tiempo para aprobación","stepMatchArguments":[]},{"pwStepLine":89,"gherkinStepLine":117,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe aceptar el envío de la hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":90,"gherkinStepLine":118,"keywordType":"Outcome","textWithKeyword":"And la hoja de tiempo debe quedar en estado Submitted","stepMatchArguments":[]}]},
  {"pwTestLine":93,"pickleLine":125,"tags":["@ui","@time","@regresion","@CP-TIM-008"],"steps":[{"pwStepLine":94,"gherkinStepLine":127,"keywordType":"Context","textWithKeyword":"Given que el usuario está autenticado en OrangeHRM","stepMatchArguments":[]},{"pwStepLine":95,"gherkinStepLine":128,"keywordType":"Context","textWithKeyword":"And existe una hoja de tiempo en estado Submitted disponible para aprobación","stepMatchArguments":[]},{"pwStepLine":96,"gherkinStepLine":130,"keywordType":"Action","textWithKeyword":"When aprueba la hoja de tiempo","stepMatchArguments":[]},{"pwStepLine":97,"gherkinStepLine":132,"keywordType":"Outcome","textWithKeyword":"Then el sistema debe aceptar la aprobación","stepMatchArguments":[]},{"pwStepLine":98,"gherkinStepLine":133,"keywordType":"Outcome","textWithKeyword":"And la hoja de tiempo debe quedar en estado Approved","stepMatchArguments":[]},{"pwStepLine":99,"gherkinStepLine":134,"keywordType":"Outcome","textWithKeyword":"And no debe permitir modificar las horas registradas","stepMatchArguments":[]}]},
]; // bdd-data-end