const use = document.querySelector('#now');
const form = document.querySelector('.info');
const cancel = document.querySelector('#canc');
const estimate = document.querySelector('#getest');
const show = document.querySelector('#resultdiv');
let result;
let data ={
    region: {
        name: '',
        country: '',
        avgAge: 0,
        avgDailyIncomeInUSD: 0,
        avgDailyIncomePopulation:0
    },
    periodType:'',
    timeToElapse: '',
    reportedCases: '',
    population: '',
    totalHospitalBeds: ''
};
const showResult = ()=>{
  const imc = document.querySelector('.ici');
  const sci = document.querySelector('.sci');
  const iIRT = document.querySelector('.iBRT');
  const sIRT = document.querySelector('.siBRT');
  const icase = document.querySelector('.isBRT');
  const scase = document.querySelector('.sSBRT');
  const ibed = document.querySelector('.ibed');
  const sbed = document.querySelector('.sbed');
  const iIcu = document.querySelector('.iIcu');
  const sIcu = document.querySelector('.sIcu');
  const ivent = document.querySelector('.iVent');
  const svent = document.querySelector('.sVent');
  const idolla = document.querySelector('.iFlt');
  const sdolla = document.querySelector('.sFlt');

  imc.innerHTML=result.impact.currentlyInfected;
  sci.innerHTML=result.severeImpact.currentlyInfected;
  iIRT.innerHTML= result.impact.infectedByRequestedTime;
  sIRT.innerHTML= result.severeImpact.infectedByRequestedTime;
  icase.innerHTML = result.impact.severeCasesByRequestedTime;
  scase.innerHTML = result.severeImpact.severeCasesByRequestedTime;
  ibed.innerHTML = result.impact.hospitalBedsByRequestedTime;
  sbed.innerHTML = result.severeImpact.hospitalBedsByRequestedTime;
  iIcu.innerHTML = result.impact.casesForICUByRequestedTime;
  sIcu.innerHTML = result.severeImpact.casesForICUByRequestedTime;
  ivent.innerHTML = result.impact.casesForVentilatorsByRequestedTime;
  svent.innerHTML = result.severeImpact.casesForVentilatorsByRequestedTime;
  idolla.innerHTML = result.impact.dollarsInFlight;
  sdolla.innerHTML = result.severeImpact.dollarsInFlight;

};
use.addEventListener('click', (e) => {
    e.preventDefault();
    use.classList.add('hide');
    form.classList.remove('hide');
});
estimate.addEventListener('click', (e) => {
    e.preventDefault();
    const reg =document.querySelector('#region').value;
    const ctry = document.querySelector('#country').value;
    const age = document.querySelector('#age').value;
    const usd = document.querySelector('#USD').value;
    const inc = document.querySelector('#income').value;
    const pop = document.querySelector('#ptn').value;
    const rCase  = document.querySelector('#rptd').value;
    const beds =document.querySelector('#hbd').value;
    const pType = document.querySelectorAll('option');
    const time = document.querySelector('#time').value;
    const warn = document.querySelector('.warning');
    //function to select the value of option
    const s = (x) =>{
        let b ='';
        for (let i = 0; i < x.length; i++) {
            if(x[i].selected){
                b = x[i].text;
            }
        }
        return b;
    }
  const y = (reg === '' || ctry === '' || !parseInt(age) || !parseInt(usd) || !Number(inc));
  const x = (!parseInt(pop) || !parseInt(beds) || !parseInt(time) || !parseInt(rCase));
  if(x || y){
      warn.innerHTML='Fill out all Fields correctly before continuing.';
  }else{
    data.region.name=reg;
    data.region.country = ctry;
    data.region.avgAge = Number(age);
    data.region.avgDailyIncomeInUSD = parseInt(usd);
    data.region.avgDailyIncomePopulation =Number(inc);
    data.population = parseInt(pop);
    data.totalHospitalBeds = parseInt(beds);
    data.timeToElapse = parseInt(time);
    data.reportedCases = parseInt(rCase);
    data.periodType = s(pType);
    warn.innerHTML ='';

    result = estimator(data);
    showResult();
    show.classList.remove('hide');
    form.classList.add('hide');
    console.log(result);
  }
});
cancel.addEventListener('click', (e) => {
    use.classList.remove('hide');
    form.classList.add('hide');
});
let dayPeriod;
const norm = (period, time) => {
  let factor;
  if(period === 'Days'){
    factor = time / 3;
    dayPeriod = time;
  }else if (period === 'Weeks'){
      dayPeriod = (time * 7);
      factor = dayPeriod / 3;
  }else if (period === 'Months'){
      dayPeriod = (time * 30);
      factor = dayPeriod / 3;
  }else if (period === 'Years'){
      dayPeriod = (time * 365);
      factor = dayPeriod / 3;
  }
  return factor;
};
const estimator = (data) => {
  const iMcifect = data.reportedCases * 10;
  const sIcifect = data.reportedCases * 50;
  const factors = parseInt(norm(data.periodType, data.timeToElapse));
  //currently infected by request time
  const iMinfectByRT = iMcifect * (2 ** factors);
  const sIinfectByRT = sIcifect * (2 ** factors);
  //sever cases computation
  const iMscasesByRT = parseInt(iMinfectByRT * 0.15);
  const sIscasesByRT = parseInt(sIinfectByRT * 0.15);
  //Avialability of bed
  const iMbedByRT = parseInt((data.totalHospitalBeds * 0.35) - iMscasesByRT);
  const sIbedByRT = parseInt((data.totalHospitalBeds * 0.35) - sIscasesByRT);
  //Intensive care Unit cases
  const iMicuByRT = parseInt(iMinfectByRT * 0.05);
  const sIicuByRT = parseInt(sIinfectByRT * 0.05);
  //Ventilator demand
  const iMvenByRT = parseInt(iMinfectByRT * 0.02);
  const sIvenByRT = parseInt(sIinfectByRT * 0.02);
  //Dollar inflight
  const dollar = Number(data.region.avgDailyIncomePopulation * data.region.avgDailyIncomeInUSD * dayPeriod);
  const iMdolaFlit = parseInt(iMinfectByRT * dollar);
  const sIdolaFlit = parseInt(sIinfectByRT * dollar);
  return {
      data,
      impact: {
        currentlyInfected: iMcifect,
        infectedByRequestedTime: iMinfectByRT,
        severeCasesByRequestedTime: iMscasesByRT,
        hospitalBedsByRequestedTime: iMbedByRT,
        casesForICUByRequestedTime: iMicuByRT,
        casesForVentilatorsByRequestedTime: iMvenByRT,
        dollarsInFlight: iMdolaFlit
      },
      severeImpact: {
        currentlyInfected: sIcifect,
        infectedByRequestedTime: sIinfectByRT,
        severeCasesByRequestedTime: sIscasesByRT,
        hospitalBedsByRequestedTime: sIbedByRT,
        casesForICUByRequestedTime: sIicuByRT,
        casesForVentilatorsByRequestedTime: sIvenByRT,
        dollarsInFlight: sIdolaFlit
      }
    }
}
