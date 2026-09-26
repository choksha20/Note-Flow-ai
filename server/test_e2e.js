import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function request(path, method = 'GET', body = null, token = null) {
  const url = new URL(BASE_URL + path);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('==================================================');
  console.log('🧪 Starting Programmatic End-to-End Test Suite');
  console.log('==================================================\n');

  try {
    // 1. Health check
    const health = await request('/health');
    console.log('1. Health check status:', health.status, health.data.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Register User A (Alex)
    const alexEmail = `alex_${Date.now()}@noteflow.ai`;
    const alexReg = await request('/auth/register', 'POST', {
      email: alexEmail,
      password: 'Password123!',
      name: 'Alex Morgan'
    });
    console.log('2. User A Registration:', alexReg.status, alexReg.data.user?.email);
    if (alexReg.status !== 201) throw new Error('User A registration failed');
    const alexToken = alexReg.data.token;
    const alexId = alexReg.data.user.id;

    // 3. User A Auth Me
    const alexMe = await request('/auth/me', 'GET', null, alexToken);
    console.log('3. User A /auth/me check:', alexMe.status, alexMe.data.user?.name);
    if (alexMe.status !== 200) throw new Error('Auth me failed');

    // 4. Register User B (Bob)
    const bobEmail = `bob_${Date.now()}@noteflow.ai`;
    const bobReg = await request('/auth/register', 'POST', {
      email: bobEmail,
      password: 'Password123!',
      name: 'Bob Smith'
    });
    console.log('4. User B Registration:', bobReg.status, bobReg.data.user?.email);
    const bobToken = bobReg.data.token;
    const bobId = bobReg.data.user.id;

    // 5. User A Creates Note
    const rawNoteText = `Meeting transcript regarding Q4 Mobile Launch on Monday.
Alex agreed to finalize UI designs by Friday.
Sarah will set up test database by November 1st.
We decided to delay the marketing campaign until Q2 to focus on core security.
John needs to review the backend API endpoints ASAP.`;

    const createNoteRes = await request('/notes', 'POST', {
      title: 'Q4 Product & Security Sync',
      raw_text: rawNoteText
    }, alexToken);

    console.log('5. User A Note Creation:', createNoteRes.status, createNoteRes.data.note?.title, 'Status:', createNoteRes.data.note?.status);
    if (createNoteRes.status !== 201) throw new Error('Note creation failed');
    const noteId = createNoteRes.data.note.id;

    // 6. User A Processes Note with AI
    console.log('6. Processing Note with AI...');
    const processRes = await request(`/notes/${noteId}/process`, 'POST', null, alexToken);
    console.log('   Process status:', processRes.status);
    console.log('   Summary extracted:', processRes.data.note?.summary?.substring(0, 80) + '...');
    console.log('   Decisions count:', processRes.data.note?.decisions?.length);
    console.log('   Action items count:', processRes.data.action_items?.length);

    if (processRes.status !== 200) throw new Error('AI processing failed');
    const actionItems = processRes.data.action_items;
    if (!actionItems || actionItems.length === 0) throw new Error('No action items returned');

    // 7. Toggle Action Item Status
    const itemToToggle = actionItems[0];
    const toggleRes = await request(`/action-items/${itemToToggle.id}`, 'PATCH', { status: 'done' }, alexToken);
    console.log('7. Toggled action item status:', toggleRes.status, toggleRes.data.action_item?.status);
    if (toggleRes.data.action_item?.status !== 'done') throw new Error('Failed to toggle action item');

    // 8. User A Dashboard Stats
    const statsRes = await request('/dashboard/stats', 'GET', null, alexToken);
    console.log('8. User A Dashboard Stats:', statsRes.data.stats);

    // 9. DATA ISOLATION VERIFICATION: User B attempts to access User A's note
    console.log('9. DATA ISOLATION TEST: User B trying to access User A note...');
    const bNoteAccess = await request(`/notes/${noteId}`, 'GET', null, bobToken);
    console.log('   User B note access result:', bNoteAccess.status, bNoteAccess.data.error);

    if (bNoteAccess.status !== 404 && bNoteAccess.status !== 403) {
      throw new Error(`CRITICAL SECURITY FAILURE: User B accessed User A's note! Status: ${bNoteAccess.status}`);
    } else {
      console.log('   ✅ DATA ISOLATION VERIFIED: User B access denied as expected!');
    }

    // 10. User B Action Items Check
    const bActionItems = await request('/action-items', 'GET', null, bobToken);
    console.log('10. User B Action Items count:', bActionItems.data.action_items?.length);
    if (bActionItems.data.action_items?.length !== 0) {
      throw new Error('CRITICAL SECURITY FAILURE: User B can see User A action items!');
    } else {
      console.log('   ✅ DATA ISOLATION VERIFIED: User B has 0 action items!');
    }

    console.log('\n==================================================');
    console.log('🎉 ALL E2E ACCEPTANCE TESTS PASSED 100% SUCCESSFULLY!');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err.message);
    process.exit(1);
  }
}

runE2ETests();
