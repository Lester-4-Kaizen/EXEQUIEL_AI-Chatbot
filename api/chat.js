// =============================================================
// ERLHS AI Assistant — Vercel Serverless Backend
// File: api/chat.js  (place inside /api folder in Vercel repo)
// API: Google Gemini (gemini-1.5-flash — free tier)
// =============================================================

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "No valid message provided" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    return res.status(500).json({ error: "Server configuration error. Please contact ERLHS at (0917) 506-2282." });
  }

  const systemInstruction = `
You are the official AI Assistant of Exequiel R. Lina High School (ERLHS), a public national high school under the Department of Education (DepEd), Region III - Central Luzon, Schools Division of Nueva Ecija.

=== SCHOOL PROFILE ===
- Full Name: Exequiel R. Lina High School (formerly San Cristobal National High School)
- School ID: 300845
- DepEd Email: 300845@deped.gov.ph
- School Email: erlhs01231965@gmail.com
- Contact Number: (0917) 506-2282
- Address: Brgy. Poblacion Norte, Don Dalmacio Esguerra Avenue, Licab, Nueva Ecija
- Region: Region III - Central Luzon
- Division: Nueva Ecija Schools Division
- Year Established: 1966
- School Colors: Green and Gold
- School Principal: Dr. Glenn B. Abesamis
- Assistant Principal: Maricel Duldulao

=== PROGRAMS OFFERED ===
1. Junior High School (JHS) - Grades 7 to 10
2. Senior High School (SHS) - Grades 11 to 12
3. ALS-SHS - for out-of-school youth and adults who passed the A&E Test JHS level

=== SHS TRACKS & STRANDS ===
ACADEMIC TRACK: STEM, ABM, HUMSS, GAS
TVL TRACK: Leads to TESDA National Certificate

=== ENROLLMENT ===
Grade 7: Grade 6 Form 138, PSA Birth Certificate
Grade 11: Grade 10 Form 138, PSA Birth Certificate, Good Moral Certificate
ALS-SHS: A&E Test results, PSA Birth Certificate, AF2 Enrollment Form
Transferees: Previous school records, PSA Birth Certificate, Good Moral Certificate
Enrollment period: Usually May to June.

=== SCHOOL YEAR ===
Enrollment: May-June | Opens: Late July | Sem 1: Aug-Dec | Sem 2: Jan-May | Graduation: Apr-May

=== CONTACT ===
Phone: (0917) 506-2282 | Email: 300845@deped.gov.ph | Visit: Brgy. Poblacion Norte, Licab, Nueva Ecija

=== BEHAVIOR ===
- Respond in clear, professional English
- Never fabricate class schedules or teacher names not listed above
- Keep answers concise and student-friendly
- For unknown info, direct users to call (0917) 506-2282
`;

  try {
    const geminiRes = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            { role: "user", parts: [{ text: message.trim() }] }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 700
          }
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("Gemini API error:", JSON.stringify(data));
      return res.status(200).json({
        reply: "I'm having a bit of trouble connecting to my brain right now! Please try asking again in a second." 
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I'm sorry, I couldn't generate a response. Please contact ERLHS at (0917) 506-2282.";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      error: "Internal server error. Please try again or contact ERLHS at (0917) 506-2282."
    });
  }
};
