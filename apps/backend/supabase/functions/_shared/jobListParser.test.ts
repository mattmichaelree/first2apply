import { assert, assertEquals } from '@std/assert';

import { parseGlassDoorJobs } from './jobListParser.ts';
import { TestLogger } from './logger.ts';
import { parseBuiltinJobs } from './parsers/builtin.ts';
import { parseDiceJobs } from './parsers/dice.ts';
import { parseHiringCafeJobs } from './parsers/hiringCafe.ts';
import { parseLinkedInJobs } from './parsers/linkedin.ts';
import { parseRemoteioJobs } from './parsers/remoteio.ts';

const linkedinUrl = new URL('./__fixtures__/jobBoards/linkedin.html', import.meta.url);
const diceUrl = new URL('./__fixtures__/jobBoards/dice.html', import.meta.url);
const diceNoResultsUrl = new URL('./__fixtures__/jobBoards/dice-no-results.html', import.meta.url);
const hiringCafeUrl = new URL('./__fixtures__/jobBoards/hiringcafe.html', import.meta.url);

const logger = new TestLogger();

Deno.test('Glassdoor parses company and logo when generated CSS class suffixes change', () => {
  const html = `<ul class="JobsList_jobsList__lqjTr">
    <li data-jobid="1010315006122" data-test="jobListing">
      <div class="jobCard JobCard_jobCardContent__Bbij_">
        <div id="job-employer-1010315006122" class="EmployerProfile_profileContainer__FbmWc">
          <img src="https://example.com/logo.png" alt="Company Logo">
          <div class="EmployerProfile_employerNameContainer__Wt7K9">
            <span class="EmployerProfile_compactEmployerName__hAn5f">USA TODAY Co.</span>
          </div>
        </div>
        <a id="job-title-1010315006122" href="https://www.glassdoor.com/job-listing/example?jl=1010315006122">Sr Director, Marketing Operations</a>
        <div id="job-location-1010315006122">Remote</div>
        <div id="job-salary-1010315006122">$150K - $170K (Employer provided)</div>
      </div>
    </li>
  </ul>`;

  const result = parseGlassDoorJobs({ siteId: 2, html });

  assert(result.listFound);
  assertEquals(result.elementsCount, 1);
  assertEquals(result.jobs.length, 1);
  assertEquals(result.jobs[0].externalId, '1010315006122');
  assertEquals(result.jobs[0].companyName, 'USA TODAY Co.');
  assertEquals(result.jobs[0].companyLogo, 'https://example.com/logo.png');
  assertEquals(result.jobs[0].title, 'Sr Director, Marketing Operations');
});

Deno.test('Built In job parsing reads the current job-match payload', () => {
  const html = `<script>Builtin.jobMatchInit({"jobs":[{"id":11448066,"title":"Director, Lifecycle Marketing","url":"https://builtin.com/job/director-lifecycle-marketing/11448066","companyName":"Braze","companyLogo":"https://builtin.com/braze.png","location":"Austin, TX","isRemote":false,"isHybrid":true,"isOnSite":true,"body":"Use tools (carefully); keep going"},{"id":"11465531","title":"Principal Product Marketing Manager","url":"https://builtin.com/job/principal-product-marketing-manager/11465531","companyName":"GitLab","companyLogo":null,"location":"United States","isRemote":true,"isHybrid":false,"isOnSite":false}]});</script>`;

  const result = parseBuiltinJobs({ siteId: 103, html });

  assert(result.listFound, 'Expected Built In job-match payload to be located');
  assertEquals(result.elementsCount, 2);
  assertEquals(result.jobs.length, 2);
  assertEquals(result.jobs[0], {
    siteId: 103,
    externalId: '11448066',
    externalUrl: 'https://builtin.com/job/director-lifecycle-marketing/11448066',
    title: 'Director, Lifecycle Marketing',
    companyName: 'Braze',
    companyLogo: 'https://builtin.com/braze.png',
    location: 'Austin, TX',
    jobType: 'hybrid',
    labels: [],
    tags: [],
  });
  assertEquals(result.jobs[1]?.jobType, 'remote');
});

Deno.test('parseLinkedInJobs parses v1 list markup', async () => {
  const fileContent = await Deno.readTextFile(linkedinUrl);

  const result = parseLinkedInJobs({
    siteId: 99,
    html: fileContent,
    logger,
  });

  logger.info('Parsed LinkedIn jobs result:', result);
  assert(result.listFound, 'Expected LinkedIn list markup to be located');
  assertEquals(result.elementsCount, 25);
  assertEquals(result.jobs.length, 25);

  const [firstJob] = result.jobs;

  assert(firstJob, 'First job should be parsed');
  assertEquals(firstJob.externalId, '4358318235');
  assertEquals(firstJob.externalUrl, 'https://www.linkedin.com/jobs/view/4358318235');
  assertEquals(firstJob.title, 'Senior Technical Recruiter');
  assertEquals(firstJob.companyName, 'Jua');
  assert(firstJob.companyLogo, 'Company logo should be parsed');
  assertEquals(firstJob.location, 'Zurich');

  const lastJob = result.jobs.at(-1);

  assert(lastJob, 'Last job should be parsed');
  assertEquals(lastJob.externalId, '4370949635');
  assertEquals(lastJob.externalUrl, 'https://www.linkedin.com/jobs/view/4370949635');
  assertEquals(lastJob.title, 'Recruitment Consultant');
  assertEquals(lastJob.companyName, 'CJ Recruitment');
  assert(lastJob.companyLogo, 'Company logo should be parsed');
  assertEquals(lastJob.location, 'Zurich, Switzerland');
});

Deno.test('Dice job parsing', async () => {
  const fileContent = await Deno.readTextFile(diceUrl);

  const result = parseDiceJobs({
    siteId: 100,
    html: fileContent,
  });

  assert(result.listFound, 'Expected Dice list markup to be located');
  assertEquals(result.elementsCount, 31);
  assertEquals(result.jobs.length, 31);

  const [firstJob] = result.jobs;

  assert(firstJob, 'First job should be parsed');
  assertEquals(firstJob.siteId, 100);
  assertEquals(firstJob.externalId, '98786fd466ac0d22304559e8afb5f891');
  assertEquals(firstJob.externalUrl, 'https://www.dice.com/job-detail/abf85c41-21c0-418c-9493-908c5db3f115');
  assertEquals(firstJob.title, 'C++ Software Engineer');
  assertEquals(firstJob.companyName, 'FishEye Software');
  assertEquals(firstJob.location, 'Marlborough, Massachusetts');
  assertEquals(firstJob.jobType, 'onsite');
  assertEquals(firstJob.salary, 'USD 80,000.00 - 190,000.00 per year');
  assertEquals(firstJob.tags, ['Today', 'Sponsored', 'Full-time']);
  assert(firstJob.companyLogo, 'Company logo should be parsed');

  // remote and hybrid roles are derived from the location line
  const remoteJob = result.jobs.find((job) => job.externalId === '964a1857dd7ee0e4c1d9985e2c9143e2');
  assert(remoteJob, 'Remote job should be parsed');
  assertEquals(remoteJob.location, 'Remote');
  assertEquals(remoteJob.jobType, 'remote');

  const hybridJob = result.jobs.find((job) => job.externalId === 'c9b4b414b29f0a03dda3f88c5891e9bc');
  assert(hybridJob, 'Hybrid job should be parsed');
  assertEquals(hybridJob.location, 'Hybrid in Los Angeles, California');
  assertEquals(hybridJob.jobType, 'hybrid');

  const lastJob = result.jobs.at(-1);

  assert(lastJob, 'Last job should be parsed');
  assertEquals(lastJob.externalId, '42489a54b97eaf28f376c6a572a7ab4b');
  assertEquals(lastJob.externalUrl, 'https://www.dice.com/job-detail/43a0972d-683e-4a14-bd9d-1633b96c6445');
  assertEquals(lastJob.title, 'Principal Software Engineer');
  assertEquals(lastJob.companyName, 'WinMax Systems Corporation');
  assertEquals(lastJob.location, 'Hybrid in Los Angeles, California');
  assertEquals(lastJob.jobType, 'hybrid');
  assertEquals(lastJob.salary, '75 - 82');
  assertEquals(lastJob.tags, ['6d ago', 'Easy Apply', 'Contract']);
  assert(lastJob.companyLogo, 'Company logo should be parsed');
});

Deno.test('Dice job parsing handles an empty result list', async () => {
  const fileContent = await Deno.readTextFile(diceNoResultsUrl);

  const result = parseDiceJobs({
    siteId: 100,
    html: fileContent,
  });

  assert(result.listFound, 'Expected Dice no results markup to be recognised');
  assertEquals(result.elementsCount, 0);
  assertEquals(result.jobs.length, 0);
});

Deno.test('Remote.io job parsing', async () => {
  const remoteioUrl = new URL('./__fixtures__/jobBoards/remoteio.html', import.meta.url);
  const fileContent = await Deno.readTextFile(remoteioUrl);

  const result = parseRemoteioJobs({
    siteId: 101,
    html: fileContent,
  });

  assert(result.listFound, 'Expected Remote.io list markup to be located');
  assertEquals(result.elementsCount, 50);
  assertEquals(result.jobs.length, 50);

  const [firstJob] = result.jobs;

  assert(firstJob, 'First job should be parsed');
  assertEquals(firstJob.externalId, 'card-job-48c809b2-cb1a-4d45-8d08-3b5d284fd10e');
  assertEquals(
    firstJob.externalUrl,
    'https://remote.io/remote-jobs/customer-service/senior-customer-support-associate-at-laurel-69727',
  );
  assertEquals(firstJob.title, 'Senior Customer Support Associate');
  assertEquals(firstJob.companyName, 'Laurel');
  assertEquals(firstJob.location, 'United States');
  assertEquals(firstJob.jobType, 'remote');
  assertEquals(firstJob.salary, '$85,000 - $95,000 / year');
  assertEquals(firstJob.tags, ['Customer Service', '1d']);
  assert(firstJob.companyLogo, 'Company logo should be parsed');

  const lastJob = result.jobs.at(-1);

  assert(lastJob, 'Last job should be parsed');
  assertEquals(lastJob.externalId, 'card-job-73306a96-a365-4bc6-ae31-b0e80d4a5fa6');
  assertEquals(
    lastJob.externalUrl,
    'https://remote.io/remote-jobs/customer-service/support-engineer-us-east-ic2-at-sourcegraph-69480',
  );
  assertEquals(lastJob.title, 'Support Engineer - US East [IC2]');
  assertEquals(lastJob.companyName, 'Sourcegraph');
  assertEquals(lastJob.location, 'United States');
  assertEquals(lastJob.jobType, 'remote');
  assertEquals(lastJob.salary, '$84,800 / year');
  assertEquals(lastJob.tags, ['Customer Service', '5d']);
  assert(lastJob.companyLogo, 'Company logo should be parsed');
});

Deno.test('Hiring Cafe job parsing', async () => {
  const fileContent = await Deno.readTextFile(hiringCafeUrl);

  const result = parseHiringCafeJobs({
    siteId: 102,
    html: fileContent,
  });

  assert(result.listFound, 'Expected Hiring Cafe list markup to be located');
  assertEquals(result.elementsCount, 10);
  assertEquals(result.jobs.length, 10);

  const [firstJob] = result.jobs;

  assert(firstJob, 'First job should be parsed');
  assertEquals(firstJob.siteId, 102);
  assertEquals(firstJob.externalId, 'uqwr7pqvbx1llubw');
  assertEquals(firstJob.externalUrl, 'https://hiringcafe.com/job/uqwr7pqvbx1llubw');
  assertEquals(firstJob.title, 'Drive Systems Sales Specialist');
  assertEquals(firstJob.companyName, 'Schneider Electric');
  assertEquals(firstJob.location, 'Milan or Stezzano or Turin');
  assertEquals(firstJob.jobType, 'onsite');
  assertEquals(firstJob.tags, ['Full Time']);
  assert(firstJob.companyLogo, 'Company logo should be parsed');
});
