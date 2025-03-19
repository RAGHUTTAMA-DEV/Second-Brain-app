import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Link, useNavigate } from "react-router-dom";

function App() {
  const [verified, setVerified] = useState(false);
  const [token, setToken] = useState("");

  return (
    <BrowserRouter>
       <nav className="navbar">
  <a href="/" className="brand">Second Brain App</a>
  <div className="nav-links">
    <Link to="/" className="nav-link">Landing Page</Link>
    <Link to="/signup" className="nav-link">Signup</Link>
    <Link to="/signin" className="nav-link">Signin</Link>
    <Link to="/content" className="nav-link">Add Content</Link>
    <Link to="/share" className="nav-link">Share</Link>
    <Link to="/shared-content" className="nav-link">Shared Content</Link>
  </div>
        </nav>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup setVerified={setVerified} />} />
        <Route path="/signin" element={<Signin setVerified={setVerified} setToken={setToken} />} />
        <Route path="/content" element={<Content verified={verified} token={token} />} />
        <Route path="/share" element={<Share token={token} />} />
        <Route path="/shared-content" element={<SharedContent token={token} />} />
      </Routes>
    </BrowserRouter>
  );
}

function Signup({ setVerified }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function signupapi() {
    try {
      const response = await fetch("http://localhost:3004/api/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        alert("Signup successful!");
        setVerified(true);
      } else {
        alert(`Signup failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred during signup.");
    }
  }

  return (
    <div>
      <h1>Signup</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signupapi}>Sign-up</button>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to the Second-Brain app!</h1>
      <button onClick={() => navigate("/signup")}>Sign-up</button>
      <button onClick={() => navigate("/signin")}>Sign-in</button>
      <button onClick={() => navigate("/content")}>Add Content</button>
      <button onClick={()=>navigate('/share')}>Share content</button>
      <button onClick={()=>navigate('/shared-contents')}>Shared-contents</button>
    </div>
  );
}

function Signin({ setVerified, setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function signinapi() {
    try {
      const response = await fetch("http://localhost:3004/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        alert("Sign-in successful!");
        setVerified(true);
        setToken(data.token);
      } else {
        alert(`Sign-in failed: ${data.message}`);
      }
    } catch (error) {
      console.error("An error occurred during sign-in:", error);
      alert("An error occurred during sign-in.");
    }
  }

  return (
    <div>
      <h1>Sign-in</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signinapi}>Sign-in</button>
    </div>
  );
}

function Content({ verified, token }) {
  return <div>{verified ? <Contentcomp token={token} /> : <h2>Access Denied</h2>}</div>;
}

function Contentcomp({ token }) {
  const [link, setLink] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [contentList, setContentList] = useState([]);
  const [error, setError] = useState(null);

  async function fetchContent() {
    if (!token) {
      setError("Unauthorized: Please sign in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3004/api/content", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching content: ${response.statusText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server.");
      }

      setContentList(data);
      setError(null);
    } catch (error) {
      console.error("Fetch Error:", error);
      setError(error.message);
    }
  }

  useEffect(() => {
    fetchContent();
  }, [token]);

  async function addContentApi() {
    if (!token) {
      alert("Unauthorized: Please sign in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3004/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ link, tags, title, type }),
      });

      if (!response.ok) {
        throw new Error("Failed to add content.");
      }

      alert("Content Added Successfully");
      setLink("");
      setTags("");
      setTitle("");
      setType("");
      fetchContent();
    } catch (error) {
      console.error("Error adding content:", error);
      alert(error.message);
    }
  }

  return (
    <div>
      <h1>Add Content</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input type="text" placeholder="Link" value={link} onChange={(e) => setLink(e.target.value)} />
      <input type="text" placeholder="Type" value={type} onChange={(e) => setType(e.target.value)} />
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Tags" value={tags} onChange={(e) => setTags(e.target.value)} />
      <button onClick={addContentApi}>Add Content</button>

      <h2>Existing Content</h2>
      {contentList.length > 0 ? (
        <ul>
          {contentList.map((content, index) => (
            <li key={index}>
              <strong>Title:</strong> {content.title} <br />
              <strong>Link:</strong> <a href={content.link} target="_blank" rel="noopener noreferrer">{content.link}</a> <br />
              <strong>Type:</strong> {content.type} <br />
              <strong>Tags:</strong> {content.tags} <br />
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No content available.</p>
      )}
    </div>
  );
}


function Share({ token }) {
  const [courseid, setCourseid] = useState("");
  const [targetid, setTargetid] = useState("");

  async function shareapi() {
    if (!token) {
      alert("Unauthorized: Please sign in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3004/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Fixed Authorization header
        },
        body: JSON.stringify({
          courseid: courseid,
          targetid: targetid,
        }),
      });

      if (response.ok) {
        alert("Shared Successfully");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error sharing content:", error);
      alert("An error occurred while sharing content.");
    }
  }

  return (
    <div>
      <h2>Share Content</h2>
      <input
        type="text"
        placeholder="Course ID"
        value={courseid}
        onChange={(e) => setCourseid(e.target.value)}
      />
      <input
        type="text"
        placeholder="Target User ID"
        value={targetid}
        onChange={(e) => setTargetid(e.target.value)} // Fixed typo
      />
      <button onClick={shareapi}>Share</button>
    </div>
  );
}

function SharedContent({ token }) {
  const [sharedContentList, setSharedContentList] = useState([]);
  const [error, setError] = useState(null);

  async function fetchSharedContent() {
    if (!token) {
      setError("Unauthorized: Please sign in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3004/api/shared-content", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Correct Authorization header
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching shared content: ${response.statusText}`);
      }

      const data = await response.json();
      setSharedContentList(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching shared content:", error);
      setError(error.message);
    }
  }

  useEffect(() => {
    fetchSharedContent();
  }, [token]);

  return (
    <div>
      <h2>Shared Content</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {sharedContentList.length > 0 ? (
        <ul>
          {sharedContentList.map((sharedItem, index) => (
            <li key={index}>
              <strong>Title:</strong> {sharedItem.contentId.title} <br />
              <strong>Link:</strong>{" "}
              <a
                href={sharedItem.contentId.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sharedItem.contentId.link}
              </a>{" "}
              <br />
              <strong>Type:</strong> {sharedItem.contentId.type} <br />
              <strong>Tags:</strong> {sharedItem.contentId.tags.join(", ")} <br />
              <strong>Shared By:</strong> {sharedItem.sharedBy.username} <br />
              <strong>Shared At:</strong> {new Date(sharedItem.sharedAt).toLocaleString()} <br />
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No shared content available.</p>
      )}
    </div>
  );
}

export default App;
