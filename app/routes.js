//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// ---------- Start prototype ----------
router.get('/start', function (req, res) {
  req.session.data.version = req.query.version
  const startPage = req.query.startPage

  if(startPage == 'step'){
    res.redirect(`/${req.session.data.version}/step-by-step`)
  } else {
  res.redirect(`/${req.session.data.version}/before-you-start`)
  }
})

// ---------- CURRENT ----------
// ---------- Before you start - authority question ----------
 
router.post('/:version/before-you-start', function (req, res) {

  const version = req.params.version;

  if (req.session.data['authority-consent'] === 'yes') {
    req.session.data.showAuthorityError = false;
    return res.redirect(`/${version}/enter-death-registration-details`);
  }

  if (req.session.data['authority-consent'] === 'no') {
    req.session.data.showAuthorityError = true;
    return res.render(`/${version}/before-you-start`);
  }
});

// ---------- Get: About you ---------- 
router.get('/:version/about-you', function (req, res) {

  const version = req.params.version;

  const edit = req.query.edit;
  console.log("Edit: " + edit)

  req.session.data['edit'] = edit;

  return res.render(`/${version}/about-you`);
});

// ---------- Get: About the spouse ---------- 
router.get('/:version/about-the-spouse', function (req, res) {

  const version = req.params.version;

  const edit = req.query.edit;
  console.log("Edit: " + edit)

  req.session.data['edit'] = edit;

  return res.render(`/${version}/about-the-spouse`);
})

// ---------- Post: Relationship to deceased ---------- 
router.post('/:version/relationship-to-deceased', function (req, res) {
  const relationship = req.session.data['informer-relationship'];
  const edit = req.session.data['edit']

  console.log("Edit: " + edit)

  if (edit === 'true') {
    req.session.data['edit'] = false;
    return res.redirect('check-your-answers-1');
  }

  if (["Husband", "Wife", "Spouse", "Civil Partner", "Partner"].includes(relationship)){
    return res.redirect('about-the-spouse')
  }
    return res.redirect('check-your-answers-1');
});

// ---------- Post: About the spouse ---------- 
router.post('/:version/check-your-answers-1', function (req, res) {
  const edit = req.session.data['edit']

  console.log("Edit: " + edit)

  if (edit === 'true') {
    req.session.data['edit'] = false;
  }

  return res.redirect('check-your-answers-1');

});


// ---------- Next of kin ---------- 
router.post('/current/about-the-next-of-kin', function (req, res) {
  if(req.session.data['informer-next-of-kin'] == "yes"){
    return res.redirect('about-the-person-whos-died');
  } else {
    return res.redirect('about-the-next-of-kin');
  }
  
});

// ---------- Next of kin / person dealing with estate ---------- 
router.post('/:version/what-well-ask-about-the-next-of-kin', function (req, res) {

  const version = req.params.version;

  const relationship = req.session.data['informer-relationship'];
  const executor = req.session.data['informer-deal-estate'];

  if (["Husband", "Wife", "Spouse", "Civil Partner", "Partner"].includes(relationship) || executor == "no"){
    return res.redirect('what-well-ask-about-the-next-of-kin')
  }
    return res.redirect('before-we-send');
});


// ---------- About the person who's died ---------- 
router.get('/current/deceased-address', function (req, res) {

  req.session.data['deceased-address-state'] = "lookup";
  req.session.data['deceased-has-other-address'] = "yes";

  res.redirect('/current/about-the-person-whos-died#deceased-lookup');
});

router.post('/current/deceased-address-results', function (req, res) {

  const postcode = req.session.data['deceased-address-postcode'];

  if (postcode === "ZZ1 1ZZ") {
    req.session.data['deceased-address-result-type'] = "none";
  } else {
    req.session.data['deceased-address-result-type'] = "radio";
  }

  req.session.data['deceased-address-state'] = "lookup";
  req.session.data['deceased-has-other-address'] = "yes";

  res.redirect('/current/about-the-person-whos-died#deceased-resultlist-radio');
});

router.get('/current/deceased-address-manual', function (req, res) {

  req.session.data['deceased-address-state'] = "manual";
  req.session.data['deceased-has-other-address'] = "yes";

  res.redirect('/current/about-the-person-whos-died#deceased-manual');
});

router.get('/current/place-of-death-address', function (req, res) {

  req.session.data['place-of-death-address-state'] = "lookup";
  req.session.data['place-of-death-address'] = "yes";

  res.redirect('/current/about-the-person-whos-died#place-lookup');
});

router.post('/current/place-of-death-address-results', function (req, res) {

  const postcode = req.session.data['place-of-death-address-postcode'];

  if (postcode === "ZZ1 1ZZ") {
    req.session.data['place-of-death-address-result-type'] = "none";
  } else {
    req.session.data['place-of-death-address-result-type'] = "radio";
  }

  req.session.data['place-of-death-address-state'] = "lookup";
  req.session.data['place-of-death-address'] = "yes";

  res.redirect('/current/about-the-person-whos-died#place-resultlist-radio');
});

router.get('/current/place-of-death-address-manual', function (req, res) {

  req.session.data['place-of-death-address-state'] = "manual";
  req.session.data['place-of-death-address'] = "yes";

  res.redirect('/current/about-the-person-whos-died#place-manual');
});

router.post('/current/their-national-insurance-number', function (req, res) {

  const selectedAddress = req.session.data['deceased-address'];

  if (selectedAddress) {

    const parts = selectedAddress.split('|');

    const formatted = [
      parts[0],   // building
      parts[1],   // street
      parts[2],   // town
      parts[4],   // country (optional)
      parts[5]    // postcode
    ].filter(Boolean).join('\n');

    req.session.data['formatted-address'] = formatted;
  }

  res.redirect('/:version/their-national-insurance-number'); 
});

// ---------- Is there a next of kin? ---------- 
router.post('/:version/is-there-a-next-of-kin', function (req, res) {

  const nok = req.session.data['informer-next-of-kin'];
  const relationship = req.session.data['informer-relationship'];
  const informerDealEstate = req.session.data['informer-deal-estate'];

  const isSpouse =
    ["Husband", "Wife", "Spouse", "Civil Partner", "Partner"]
      .includes(relationship);

  // 4. Informer is not next of kin
  if (nok === "no") {
    return res.redirect('about-the-next-of-kin');
  }

  // 1. Informer is next of kin but not spouse
  if (!isSpouse) {
    return res.redirect('about-the-spouse-not-spouse');
  }

  // 3. Informer is spouse and not dealing with estate
  if (informerDealEstate === "no") {
    return res.redirect('about-the-person-dealing-with-the-estate');
  }

  // 2. Informer is spouse and dealing with estate
  if (informerDealEstate === "yes") {
    return res.redirect('email-confirmation');
  }

});

router.post('/:version/about-the-spouse-not-spouse', function (req, res) {

  const relationship = req.session.data['informer-relationship'];
  const maritalStatus = req.session.data['deceased-marital-status']
  const informerDealEstate = req.session.data['informer-deal-estate'];

  const isSpouse =
    ["Husband", "Wife", "Spouse", "Civil Partner", "Partner"]
      .includes(relationship);

  const isMarried = 
    ["Married", "Civil Partnership"]
    .includes(maritalStatus)

  // Informer is spouse and informer dealing with estate
  if (isSpouse && informerDealEstate === "yes") {
    return res.redirect('check-your-answers-4');
  }

  // Informer is spouse and informer not dealing with estate
  if (isSpouse && informerDealEstate === "no") {
    return res.redirect('about-the-person-dealing-with-the-estate');
  }

  // Informer is not spouse and deceased is single and informer dealing with estate
  if (!isSpouse && !isMarried && informerDealEstate === "yes") {
    return res.redirect('check-you-answers-4');
  }

  // Informer is not spouse and deceased is single and informer is not dealing with estate
  if (!isSpouse && !isMarried && informerDealEstate === "no") {
    return res.redirect('about-the-person-dealing-with-the-estate');
  }

  // Informer is not spouse and deceased is married
  if (!isSpouse && isMarried) {
    return res.redirect('about-the-spouse-not-spouse');
  }

});

router.post('/:version/about-the-person-dealing-with-the-estate', function (req, res) {

  
  const informerDealEstate = req.session.data['informer-deal-estate'];
  const spouseDealEstate = req.session.data['spouse-deal-with-estate']

  // Informer is dealing with estate
  if (informerDealEstate === "yes") {
    return res.redirect('check-your-answers-4');
  }

  // Informer not dealing with estate and spouse is not dealing with estate
  if (spouseDealEstate === "no" && informerDealEstate === "no") {
    return res.redirect('about-the-person-dealing-with-the-estate');
  }

 // Informer not dealing with estate and spouse is dealing with estate
  if (spouseDealEstate === "yes" && informerDealEstate === "no") {
    return res.redirect('check-your-answers-4');
  }

});

// ---------- END CURRENT ---------- 

// ---------- V0.1 STANDALONE DESIGNS ---------- 

// ---------- Address lookup ---------- 
router.get('/v0_1/enrichment/address-lookup/find-address-single-page', function (req, res) {
  req.session.data['state'] = "lookup";  
  res.render('/v0_1/enrichment/address-lookup/find-address-single-page');
});


router.get('/v0_1/enrichment/address-lookup/find-address-single-page-lookup', function (req, res) {
  req.session.data['resultType'] = null;
  req.session.data['state'] = "lookup";
  req.session.data['addr'] = "yes";
  res.redirect('/v0_1/enrichment/address-lookup/find-address-single-page#lookup');
});

router.get('/v0_1/enrichment/address-lookup/find-address-single-page-manual', function (req, res) {
  req.session.data['resultType'] = null;
  req.session.data['state'] = "manual";
  req.session.data['addr'] = "yes";
  res.redirect('/v0_1/enrichment/address-lookup/find-address-single-page#manual');
});

router.post('/v0_1/enrichment/address-lookup/find-address-single-page-results', function (req, res) {
  const addressLookupState = req.session.data['resultType'];
   
  if(addressLookupState){
    res.redirect(`/v0_1/enrichment/address-lookup/find-address-single-page#resultlist-${addressLookupState}`)
  } else {
    res.redirect('/v0_1/enrichment/address-lookup/find-address-single-page')
  }
});

// ---------- Pensions journey ---------- 
router.get('/v0_1/ni-number', function (req, res) {
  req.session.data['pensions'] = [];
  req.session.data.returnTo = req.query.returnTo;
  req.session.data.path = req.query.path;
  console.log("Path: " + req.session.data.path)
  res.render('/v0_1/ni-number');
});

router.post('/:version/ni-number', function (req, res) {

  const version = req.params.version;
  console.log("Version: " + version);

  if (req.session.data['has-ni-number'] === "yes") {

    const niNum = req.session.data['ni-number'].replace(/\s/g, '');
    req.session.data['ni-number'] = niNum;

    console.log("NI number: " + niNum);

    if (niNum === "QQ123456C") {
      req.session.data['public-sector-pensions-found'] = "no";
      return res.redirect(`/${version}/no-public-sector-pensions-found`);
    }

    if (niNum === "QQ112233C") {
      return res.redirect(`/${version}//notify-a-public-sector-pension-provider`);
    }

    return res.redirect(`/${version}/notify-a-public-sector-pension`);

  }

  return res.redirect(`/${version}/check-your-answers-3`);
});

router.get('/v0_1/enrichment/notify-public-sector-pension-providers/notify-a-public-sector-pension', function (req, res) {
  req.session.data.returnTo = req.query.returnTo;
  res.render('/v0_1/enrichment/notify-public-sector-pension-providers/notify-a-public-sector-pension');
});

router.post('/v0_1/enrichment/notify-public-sector-pension-providers/check-answers', function (req, res) {
  const pensions = req.session.data['pensions']
  console.log(pensions)
  console.log(req.session.data)
  if(req.session.data['version'] === 'current'){
    console.log("Informer dealing with estate: " + req.session.data['next-of-kin-deal-estate'] + "\n" + "Next of kind dealing with estate: " + req.session.data['informer-deal-estate'])
    if(req.session.data['next-of-kin-deal-estate'] == 'no' || req.session.data['informer-deal-estate'] == 'no') {
      return res.redirect('/current/about-the-person-dealing-with-the-estate')
    }
    return res.redirect('/current/check-your-answers-1')
  } else {
  return res.redirect('/v0_1/enrichment/check-answers')
  }
});

router.post('/v0_1/enrichment/check-answers', function (req, res) {
  const notifyPension = req.session.data['notify-pension'];

  if (notifyPension === 'yes') {
    let pensions = req.session.data['pensions'];
    if (!Array.isArray(pensions)) {
      pensions = pensions ? [pensions] : [];
    }
    if (!pensions.includes('Civil Service Pension')) {
      pensions.push('Civil Service Pension');
    }
    req.session.data['pensions'] = pensions;
  } else {
    delete req.session.data['pensions'];
  }

  res.redirect('/v0_1/enrichment/check-answers');
});
// End Pensions journey

// Capture journey
router.post('/v0_1/capture/confirm-address', function (req, res) {

  const referrer = req.get('Referrer')
  console.log(referrer);

  if(referrer.includes("v0_1/capture/enter-an-address")){
    return res.redirect('/v0_1/capture/confirm-address')
  }

  const address = req.session.data['deceased-address']

  const parts = address.split(",").map(s => s.trim());
  const addressLine1 = parts[0];
  const addressLine2 = parts[1] || "";
  const town = parts[2] || "";
  const postcode = parts[3] || "";

  req.session.data['deceased-address-line-1'] = addressLine1;
  req.session.data['deceased-address-line-2'] = addressLine2;
  req.session.data['deceased-address-town'] = town;
  req.session.data['deceased-postcode'] = postcode;

  res.redirect('/v0_1/capture/confirm-address')

})

router.get('v0_1/capture/confirm-address', (req, res) => {
    req.session.data['edit-address'] = 'false';
    return res.render(`v0_1/capture/confirm-address`)
});

router.get('v0_1/capture/enter-an-address', (req, res) => {
    req.session.data['edit-address'] = req.query.editAddress;
    return res.render(`v0_1/capture/enter-an-address`)
});

router.post('/v0_1/capture/check-your-answers', function (req, res) {
  const dateOfBirth = normaliseDate(req.session.data['deceased-date-of-birth-day'], req.session.data['deceased-date-of-birth-month'], req.session.data['deceased-date-of-birth-year']);
  const dateOfDeath = normaliseDate(req.session.data['date-of-death-day'], req.session.data['date-of-death-month'], req.session.data['date-of-death-year']);
  const registrationDate = normaliseDate(req.session.data['registration-date-day'], req.session.data['registration-date-month'], req.session.data['registration-date-year']);

  if (dateOfBirth) {
    const dateString = `${dateOfBirth.day} ${dateOfBirth.month} ${dateOfBirth.year}`;
    req.session.data['date-of-birth'] = dateString;
    console.log("Date of birth: " + req.session.data['date-of-birth'])
  }
  if (dateOfDeath) {
    const dateString = `${dateOfDeath.day} ${dateOfDeath.month} ${dateOfDeath.year}`;
    req.session.data['date-of-death'] = dateString;
    console.log("Date of death: " + req.session.data['date-of-death'])
  }
  if (registrationDate) {
    const dateString = `${registrationDate.day} ${registrationDate.month} ${registrationDate.year}`;
    req.session.data['registration-date'] = dateString;
    console.log("Registration date: " + req.session.data['registration-date'])
  }
  res.redirect('/v0_1/capture/check-your-answers')

})

router.post('/v0_1/capture/select-who-will-complete-tell-us-once', function (req, res) {
  const drt = req.session.data['death-registered-today'];

  if(drt == 'yes'){

  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  const regDate = normaliseDate(day, month, year);

  req.session.data['registration-date'] = regDate;
  }
  
  res.redirect('/v0_1/capture/select-who-will-complete-tell-us-once')

})

router.post('/v0_1/capture/does-the-person-reporting-the-death-want-an-email-confirming-their-tell-us-once-reference-number', function (req, res) {
  
  const informer = req.session.data['who-will-complete-tuo']

  console.log('Who will complete TUO?: ' + informer)

  if(informer == 'You, the registrar'){
    return res.redirect('/v0_1/capture/check-your-answers')
  } else {
    return res.redirect('/v0_1/capture/does-the-person-reporting-the-death-want-an-email-confirming-their-tell-us-once-reference-number')
  }
})
// End Capture journey

// Enter death registrations details page - security lock out
router.get('/:version/registration-lookup', function (req, res) {
  if(req.session.data['registration-lookup-attempts'] == null){
    req.session.data['registration-lookup-attempts'] = 0
  } 

  const version = req.params.version;

  return res.render(`/${version}/registration-lookup`)
});


router.post('/:version/lookup-death-registration', function (req, res) {
  
  const version = req.params.version;

  const regNum = req.session.data['registration-number']
  console.log("Registration number: " + regNum)

  var attempts = req.session.data['registration-lookup-attempts']
  attempts++
  req.session.data['registration-lookup-attempts'] = attempts

  console.log("Attempts: " + req.session.data['registration-lookup-attempts'])

  let enrichmentPath = '/enrichment'

  req.session.data['journey'] = 'full-journey'

  console.log("Enrichment journey: " + req.session.data['journey'])

if (req.session.data['journey'] === 'full-journey') {
  enrichmentPath = '/enrichment/full-journey'
}

  if(attempts < 2 && regNum == "AB123C456DE7"){
    return res.redirect(`/${version}/enter-death-registration-details`)
  } 
  
  if (attempts == 3 && regNum == "AB123C456DE7"){
    console.log("Locked out")
    return res.redirect(`/${version}/we-could-not-match-the-death-registration-details`)
  }

  if (regNum != "AB123C456DE7"){
    return res.redirect(`/${version}/registration-details-found`)
  } else {
    return res.redirect(`/${version}/enter-death-registration-details`)
  }
});
// End Enter death registrations details page - security lock out


// ---------- V1 prototype ---------- 

router.post('/v1/registration-lookup-result', function (req, res) {
  const dod = normaliseDate(req.session.data['date-of-death-day'], req.session.data['date-of-death-month'], req.session.data['date-of-death-year']);
  console.log(dod);
  if (dod) {
    const dateString = `${dod.day} ${dod.month} ${dod.year}`;
    req.session.data['date-of-death'] = dateString;
    console.log("Date of death: " + req.session.data['date-of-death'])
  }
  if (req.session.data['deceased-surname'] == "Trout") {
    req.session.data['deceased-forename'] = "Kilgore"
    console.log("Forename: " == req.session.data['deceased-forename'])
  } else {
    req.session.data['deceased-forename'] = "Jane"
  }
  res.redirect('/v1/confirm-registration-details')
})

router.get('/v1/informer-details/informer-name', function (req, res) {
  req.session.data.returnTo = req.query.returnTo;
  res.render('/v1/informer-details/informer-name');
})

router.post('/v1/informer-details/informer-name', function (req, res) {
  const name = req.session.data['informer-name'];

  if (!name || name.trim() === "") {
    return res.render('v1/informer-details/informer-name', {
      error: "Enter your name"
    })
  }
  if (req.session.data.returnTo) {
    const next = req.session.data.returnTo;
    req.session.data.returnTo = null;
    return res.redirect(next);
  }
  res.redirect('/v1/informer-details/informer-relationship')
})

router.get('/v1/informer-details/informer-name', function (req, res) {
  req.session.data.returnTo = req.query.returnTo;
  res.render('/v1/informer-details/informer-name');
})

router.post('/v1/informer-details/informer-relationship', function (req, res) {
  const relationship = req.session.data['informer-relationship']

  if (!relationship || relationship.trim() === '') {
    return res.render('v1/informer-details/informer-relationship', {
      error: "Select your relationship to {{ data['deceased-forename']}} {{ data['deceased-surname']}}"
    })
  }
  if (req.session.data.returnTo) {
    const next = req.session.data.returnTo;
    req.session.data.returnTo = null;
    return res.redirect(next);
  }
  res.redirect('/v1/informer-details/informer-same-address-as-deceased')
})

router.get('/v1/informer-details/informer-same-address-as-deceased', function (req, res) {
  req.session.data.returnTo = req.query.returnTo;
  res.render('/v1/informer-details/informer-same-address-as-deceased');
})

router.post('/v1/informer-details/informer-same-address-as-deceased', function (req, res) {
  const informerSameAddress = req.session.data['informer-same-address']

  if (informerSameAddress == "yes") {
    res.redirect('/v1/informer-details/informer-details-check-answers')
  } else {
    res.redirect('/v1/informer-details/informer-address')
  }
})

router.post('/v1/informer-details/select-informer-address', function (req, res) {
  const postcode = req.session.data['informer-postcode']

  if (postcode == "W9 1NJ") {
    res.redirect('/v1/informer-details/informer-select-address')
  } else {
    res.redirect('/v1/informer-details/informer-no-address-found')
  }
})

router.post('/v1/informer-details/confirm-informer-address', function (req, res) {
  const address = req.session.data['informer-address']

  const parts = address.split(",").map(s => s.trim());
  const addressLine1 = parts[0];
  const addressLine2 = parts[1] || "";
  const town = parts[2] || "";
  const postcode = parts[3] || "";

  req.session.data['informer-address-line-1'] = addressLine1;
  req.session.data['informer-address-line-2'] = addressLine2;
  req.session.data['informer-address-town'] = town;
  req.session.data['informer-postcode'] = postcode;

  res.redirect('/v1/informer-details/informer-confirm-address')

})

router.post('/v1/informer-details/check-answers', function (req, res) {
  req.session.data['informer-details-status'] = 'completed'
  res.redirect('/v1/task-list')
})

router.post('/v1/deceased-details/next-of-kin/are-you-the-next-of-kin', function (req, res) {
  if (req.session.data['deceased-next-of-kin-informer'] == 'no') {
    res.redirect('/v1/deceased-details/next-of-kin/next-of-kin-name')
  } else {
    res.redirect('/v1/deceased-details/next-of-kin/next-of-kin-check-answers')
    console.log('Success')
  }
})

router.post('/next-of-kin-complete', function (req, res) {
  req.session.data['next-of-kin-status'] = 'completed'
  res.redirect('/v1/task-list')
})

router.get('/next-of-kin-complete', function (req, res) {
  req.session.data['next-of-kin-status'] = 'completed'
  res.redirect('/v1/task-list')
})

router.get('/v1/deceased-details/spouse-or-partner/confirm-spouse', function (req, res) {
  const data = req.session.data
  const spouseTerms = ["husband", "wife", "spouse", "civil partner"]

  const informerIsSpouse =
    spouseTerms.includes((data['informer-relationship'] || "").toLowerCase())

  const nokIsSpouse =
    spouseTerms.includes((data['next-of-kin-relationship'] || "").toLowerCase())

  if (informerIsSpouse) {
    res.redirect('/v1/deceased-details/spouse-or-partner/confirm-informer')
  } else if (nokIsSpouse) {
    res.redirect('/v1/deceased-details/spouse-or-partner/confirm-next-of-kin')
  } else {
    res.redirect('/v1/deceased-details/spouse-or-partner/who-is-spouse')
  }
})


// ---------- Utilities ---------- 

function normaliseDate(day, month, year) {

  if (!day || !month || !year) {
    console.error("Missing date field(s)");
    return null;
  }

  day = String(day).trim();
  month = String(month).trim().toLowerCase();
  year = String(year).trim();

  if (/^\d+$/.test(day)) day = String(parseInt(day, 10));
  if (/^\d+$/.test(month)) month = String(parseInt(month, 10));

  const monthMap = {
    "jan": "january", "january": "january", "1": "january",
    "feb": "february", "february": "february", "2": "february",
    "mar": "march", "march": "march", "3": "march",
    "apr": "april", "april": "april", "4": "april",
    "may": "may", "5": "may",
    "jun": "june", "june": "june", "6": "june",
    "jul": "july", "july": "july", "7": "july",
    "aug": "august", "august": "august", "8": "august",
    "sep": "september", "sept": "september", "september": "september", "9": "september",
    "oct": "october", "october": "october", "10": "october",
    "nov": "november", "november": "november", "11": "november",
    "dec": "december", "december": "december", "12": "december"
  };

  if (monthMap[month]) {
    month = monthMap[month];
  } else {
    console.error("Invalid month input");
    return null;
  }

  return { day, month, year };
}

router.get('/prototype-admin/clear-data', function (req, res) {
  req.session.data = {};

  const returnUrl = req.query.returnUrl || req.get('Referrer') || '/';

  res.redirect(returnUrl);
});

