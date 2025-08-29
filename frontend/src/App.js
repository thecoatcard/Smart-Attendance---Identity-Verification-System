import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
  registerUser,
  markAttendance,
  getUsers,
  getAttendanceRecords,
  queryChatbot,
  detectFace,
  updateUser,
  deleteUser,
  addAttendance,
  updateAttendance,
  deleteAttendance,
} from "./api";
import MonthlyReport from "./components/MonthlyReport";
import MonthlyAnalytics from "./components/MonthlyAnalytics";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Link,
  Button,
  Drawer, // Added Drawer
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import MenuIcon from "@mui/icons-material/Menu"; // Added MenuIcon
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("register");
  const [mobileOpen, setMobileOpen] = useState(false); // Added mobileOpen state

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Register User", tab: "register" },
    { text: "Mark Attendance", tab: "attendance" },
    { text: "View Students", tab: "admin" },
    { text: "Monthly Report", tab: "monthly_report" },
    { text: "Monthly Analytics", tab: "monthly_analytics" },
    { text: "Chatbot", tab: "chatbot" },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Menu
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.tab} disablePadding>
            <ListItemText
              primary={
                <Link
                  component="button"
                  onClick={() => setActiveTab(item.tab)}
                  className={`nav-link ${
                    activeTab === item.tab ? "active" : ""
                  }`}
                  sx={{ width: "100%", display: "block", py: 1 }} // Ensure link fills ListItem
                >
                  {item.text}
                </Link>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box className="app-container custom-cursor">
      <CustomCursor />
      <AppBar position="static" className="app-bar">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }} // Show only on small screens
          >
            <MenuIcon />
          </IconButton>
          <img src={logo} className="logo" alt="logo" />
          <Box sx={{ display: { xs: "none", md: "flex" } }} className="nav-links">
            {menuItems.map((item) => (
              <Link
                key={item.tab}
                component="button"
                onClick={() => setActiveTab(item.tab)}
                className={`nav-link ${activeTab === item.tab ? "active" : ""}`}
              >
                {item.text}
              </Link>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box sx={{ px: 4 }}>
        <div className="glass-card" sx={{ mt: 0 }}>
          <Slide
            direction="left"
            in={activeTab === "register"}
            mountOnEnter
            unmountOnExit
          >
            <div className="main-content">
              {activeTab === "register" && <UserRegistration />}
            </div>
          </Slide>
          <Slide
            direction="left"
            in={activeTab === "attendance"}
            mountOnEnter
            unmountOnExit
          >
            <div className="main-content">
              {activeTab === "attendance" && <AttendanceMarking />}
            </div>
          </Slide>
          <Slide
            direction="left"
            in={activeTab === "admin"}
            mountOnEnter
            unmountOnExit
          >
            <div>{activeTab === "admin" && <AdminDashboard />}</div>
          </Slide>
          <Slide
            direction="left"
            in={activeTab === "monthly_report"}
            mountOnEnter
            unmountOnExit
          >
            <div>{activeTab === "monthly_report" && <MonthlyReport />}</div>
          </Slide>
          <Slide
            direction="left"
            in={activeTab === "monthly_analytics"}
            mountOnEnter
            unmountOnExit
          >
            <div>
              {activeTab === "monthly_analytics" && <MonthlyAnalytics />}
            </div>
          </Slide>
          <Slide
            direction="left"
            in={activeTab === "chatbot"}
            mountOnEnter
            unmountOnExit
          >
            <div>{activeTab === "chatbot" && <ChatbotInterface />}</div>
          </Slide>
        </div>
      </Box>
    </Box>
  );
}

function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorCircleRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      const { clientX, clientY } = e;
      if (cursorDotRef.current && cursorCircleRef.current) {
        cursorDotRef.current.style.left = `${clientX}px`;
        cursorDotRef.current.style.top = `${clientY}px`;
        cursorCircleRef.current.style.left = `${clientX}px`;
        cursorCircleRef.current.style.top = `${clientY}px`;
      }
    };

    const handleMouseDown = () => {
      if (cursorCircleRef.current) {
        cursorCircleRef.current.style.transform =
          "translate(-50%, -50%) scale(0.8)";
      }
    };

    const handleMouseUp = () => {
      if (cursorCircleRef.current) {
        cursorCircleRef.current.style.transform =
          "translate(-50%, -50%) scale(1)";
      }
    };

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      <div ref={cursorDotRef} className="cursor-dot"></div>
      <div ref={cursorCircleRef} className="cursor-circle"></div>
    </>
  );
}

function UserRegistration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState("");
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [autoCaptureTriggered, setAutoCaptureTriggered] = useState(false);
  const [captureStarted, setCaptureStarted] = useState(false);

  const captureAndDetect = useCallback(async () => {
    if (!captureStarted) return;

    if (webcamRef.current && !autoCaptureTriggered) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const result = await detectFace(imageSrc);
        const context = canvasRef.current.getContext("2d");
        const video = webcamRef.current.video;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;

        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        if (result.faces && result.faces.length > 0) {
          setFaceDetected(true);
          result.faces.forEach((face) => {
            context.beginPath();
            context.rect(face.x, face.y, face.width, face.height);
            context.lineWidth = 2;
            context.strokeStyle = "var(--accent-primary)";
            context.stroke();
          });
          if (!autoCaptureTriggered) {
            setAutoCaptureTriggered(true);
            setTimeout(() => handleSubmit(imageSrc), 1000);
          }
        } else {
          setFaceDetected(false);
        }
      }
    }
  }, [autoCaptureTriggered, captureStarted]);

  useEffect(() => {
    let interval;
    if (captureStarted) {
      interval = setInterval(() => {
        captureAndDetect();
      }, 500);
    }
    return () => clearInterval(interval);
  }, [captureAndDetect, captureStarted]);

  const handleSubmit = async (imgSrcToSubmit) => {
    if (!imgSrcToSubmit) {
      setMessage("No image to register.");
      return;
    }
    setMessage("Registering...");
    const result = await registerUser(
      name,
      email,
      mobileNumber,
      gender,
      imgSrcToSubmit
    );
    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage(result.message);
      setName("");
      setEmail("");
      setMobileNumber("");
      setGender("");
      setAutoCaptureTriggered(false);
      setCaptureStarted(false);
    }
  };

  const handleStartCapture = () => {
    if (name && email && mobileNumber && gender) {
      setCaptureStarted(true);
      setMessage("Capturing started. Please look at the camera.");
    } else {
      setMessage("Please fill all the fields first.");
    }
  };

  return (
    <Box sx={{ my: 2 }} className="glass-card">
      <Typography variant="h5" gutterBottom>
        User Registration
      </Typography>
      <Box sx={{ display: "flex", gap: "2rem" }}>
        <Box className="controls-container" sx={{ flex: 1 }}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="modern-input"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modern-input"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mobile Number"
            variant="outlined"
            fullWidth
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="modern-input"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth className="modern-input" sx={{ mb: 2 }}>
            <InputLabel>Gender</InputLabel>
            <Select
              value={gender}
              label="Gender"
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value={"Male"}>Male</MenuItem>
              <MenuItem value={"Female"}>Female</MenuItem>
              <MenuItem value={"Other"}>Other</MenuItem>
            </Select>
          </FormControl>
          <button
            className="modern-button"
            onClick={handleStartCapture}
            disabled={captureStarted}
          >
            Start Capture
          </button>
          {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
        </Box>
        <Box className="camera-container" sx={{ flex: 1 }}>
          {captureStarted && (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="webcam"
                videoConstraints={{
                  facingMode: "user",
                }}
              />
              <canvas ref={canvasRef} className="canvas" />
            </>
          )}
          <Typography
            color={faceDetected ? "var(--accent-primary)" : "red"}
            className="status-text"
          >
            {faceDetected
              ? "Face Detected! Auto-capturing..."
              : "No Face Detected"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function AttendanceMarking() {
  const [message, setMessage] = useState("");
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [recognizedUsersStatus, setRecognizedUsersStatus] = useState({}); // To store status for multiple users
  const [markedUsersToday, setMarkedUsersToday] = useState(new Set()); // Track users marked today

  const processFrame = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const context = canvasRef.current.getContext("2d");
        const video = webcamRef.current.video;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;

        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // First, detect faces to draw rectangles
        const detectResult = await detectFace(imageSrc);
        if (detectResult.faces && detectResult.faces.length > 0) {
          setFaceDetected(true);
          detectResult.faces.forEach((face) => {
            context.beginPath();
            context.rect(face.x, face.y, face.width, face.height);
            context.lineWidth = 2;
            context.strokeStyle = "var(--accent-primary)";
            context.stroke();
          });

          // Then, attempt to mark attendance for each detected face
          const markResult = await markAttendance(imageSrc); // Backend will handle recognition
          if (markResult.user) {
            const userId = markResult.user.id;
            const userName = markResult.user.name;
            const status = markResult.status;

            setRecognizedUsersStatus((prevStatus) => ({
              ...prevStatus,
              [userId]: { ...markResult.user, status: status },
            }));

            if (status === "marked") {
              setMessage(`Attendance marked for ${userName}`);
              setMarkedUsersToday((prev) => new Set(prev).add(userId));
            } else if (status === "already_marked") {
              setMessage(`${userName} has already been marked today.`);
              setMarkedUsersToday((prev) => new Set(prev).add(userId)); // Ensure they are in the marked set
            } else if (status === "not_recognized") {
              setMessage("User not recognized.");
            }
          } else if (markResult.status === "not_recognized") {
            setMessage("User not recognized.");
          }
        } else {
          setFaceDetected(false);
          setMessage("No Face Detected");
        }
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      processFrame();
    }, 2000); // Process frame every 2 seconds
    return () => clearInterval(interval);
  }, [processFrame]);

  return (
    <Box sx={{ my: 2 }} className="glass-card">
      <Typography variant="h5" gutterBottom>
        Mark Attendance
      </Typography>
      <Box sx={{ display: "flex", gap: "2rem" }}>
        <Box className="controls-container" sx={{ flex: 1 }}>
          {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
          {Object.values(recognizedUsersStatus).map((userInfo) => (
            <div className="user-card" style={{ marginTop: "2rem" }} key={userInfo.id}>
              <Typography variant="h6">{userInfo.name}</Typography>
              <p>ID: {userInfo.id}</p>
              <p>Email: {userInfo.email}</p>
              <p>Mobile: {userInfo.mobile_number}</p>
              <p>Gender: {userInfo.gender}</p>
              <p>
                Status:{" "}
                <span
                  className={
                    userInfo.status === "marked"
                      ? "status-present"
                      : "status-absent"
                  }
                >
                  {userInfo.status === "marked"
                    ? "Marked Present"
                    : "Already Marked"}
                </span>
              </p>
            </div>
          ))}
        </Box>
        <Box className="camera-container" sx={{ flex: 1 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
            videoConstraints={{
              facingMode: "user",
            }}
          />
          <canvas ref={canvasRef} className="canvas" />
          <Typography
            color={faceDetected ? "var(--accent-primary)" : "red"}
            className="status-text"
          >
            {faceDetected ? "Face Detected!" : "No Face Detected"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function AdminDashboard() {
  const [usersWithAttendance, setUsersWithAttendance] = useState([]);
  const [message, setMessage] = useState("");
  const [openEditUser, setOpenEditUser] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserMobileNumber, setNewUserMobileNumber] = useState("");
  const [newUserGender, setNewUserGender] = useState("");
  const [openEditAttendance, setOpenEditAttendance] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [newAttendanceUserId, setNewAttendanceUserId] = useState("");
  const [newAttendanceTimestamp, setNewAttendanceTimestamp] = useState("");

  const fetchData = async () => {
    setMessage("Fetching data...");
    const usersResult = await getUsers();
    const attendanceResult = await getAttendanceRecords();

    if (usersResult.error || attendanceResult.error) {
      setMessage(
        `Error fetching data: ${usersResult.error || attendanceResult.error}`
      );
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const todaysAttendanceUserIds = new Set(
        attendanceResult
          .filter((record) => record.timestamp.slice(0, 10) === today)
          .map((record) => record.user_id)
      );

      const combinedData = usersResult.map((user) => ({
        ...user,
        status: todaysAttendanceUserIds.has(user.id) ? "Present" : "Absent",
      }));

      setUsersWithAttendance(combinedData);
      setMessage("");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user and all their attendance records?"
      )
    ) {
      const result = await deleteUser(userId);
      setMessage(result.message || result.error);
      fetchData();
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserMobileNumber(user.mobile_number);
    setNewUserGender(user.gender);
    setOpenEditUser(true);
  };

  const handleUpdateUser = async () => {
    const result = await updateUser(
      currentUser.id,
      newUserName,
      newUserEmail,
      newUserMobileNumber,
      newUserGender,
      null
    );
    setMessage(result.message || result.error);
    setOpenEditUser(false);
    fetchData();
  };

  const handleAddAttendance = async () => {
    const userId = prompt("Enter User ID for new attendance record:");
    if (userId) {
      const result = await addAttendance(parseInt(userId));
      setMessage(result.message || result.error);
      fetchData();
    }
  };

  const handleDeleteAttendance = async (recordId) => {
    if (
      window.confirm("Are you sure you want to delete this attendance record?")
    ) {
      const result = await deleteAttendance(recordId);
      setMessage(result.message || result.error);
      fetchData();
    }
  };

  const handleEditAttendance = (record) => {
    setCurrentAttendance(record);
    setNewAttendanceUserId(record.user_id);
    setNewAttendanceTimestamp(record.timestamp.split("T")[0]);
    setOpenEditAttendance(true);
  };

  const handleUpdateAttendance = async () => {
    const result = await updateAttendance(
      currentAttendance.id,
      newAttendanceUserId,
      newAttendanceTimestamp
    );
    setMessage(result.message || result.error);
    setOpenEditAttendance(false);
    fetchData();
  };

  return (
    <Box sx={{ my: 2 }} className="admin-dashboard">
      <Box className="dashboard-header">
        <Typography variant="h5" gutterBottom>
          View Students
        </Typography>
        <button className="modern-button refresh-button" onClick={fetchData}>
          Refresh Data
        </button>
      </Box>

      {message && <Typography sx={{ mt: 2, mb: 2 }}>{message}</Typography>}

      <div className="user-card-grid">
        {usersWithAttendance.length > 0 ? (
          usersWithAttendance.map((user) => (
            <div key={user.id} className="user-card">
              <Typography variant="h6">{user.name}</Typography>
              <p>ID: {user.id}</p>
              <p>Email: {user.email}</p>
              <p>Mobile: {user.mobile_number}</p>
              <p>Gender: {user.gender}</p>
              <p>
                Status:{" "}
                <span
                  className={
                    user.status === "Present"
                      ? "status-present"
                      : "status-absent"
                  }
                >
                  {user.status}
                </span>
              </p>
              <Box sx={{ mt: 2 }}>
                <IconButton size="small" onClick={() => handleEditUser(user)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </div>
          ))
        ) : (
          <Typography>No users registered yet.</Typography>
        )}
      </div>

      {/* Dialogs need to be updated to use the new styles */}
      <Dialog
        open={openEditUser}
        onClose={() => setOpenEditUser(false)}
        PaperProps={{ className: "glass-card" }}
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <DialogContentText className="dialog-text">
            You can update the user's information. Facial data cannot be updated
            here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="User Name"
            type="text"
            fullWidth
            variant="standard"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            className="modern-input"
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="standard"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="modern-input"
          />
          <TextField
            margin="dense"
            label="Mobile Number"
            type="text"
            fullWidth
            variant="standard"
            value={newUserMobileNumber}
            onChange={(e) => setNewUserMobileNumber(e.target.value)}
            className="modern-input"
          />
          <TextField
            margin="dense"
            label="Gender"
            type="text"
            fullWidth
            variant="standard"
            value={newUserGender}
            onChange={(e) => setNewUserGender(e.target.value)}
            className="modern-input"
          />
        </DialogContent>
        <DialogActions>
          <button
            className="modern-button"
            onClick={() => setOpenEditUser(false)}
          >
            Cancel
          </button>
          <button className="modern-button" onClick={handleUpdateUser}>
            Update
          </button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditAttendance}
        onClose={() => setOpenEditAttendance(false)}
        PaperProps={{ className: "glass-card" }}
      >
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User ID"
            type="number"
            fullWidth
            variant="standard"
            value={newAttendanceUserId}
            onChange={(e) => setNewAttendanceUserId(e.target.value)}
            className="modern-input"
          />
          <TextField
            margin="dense"
            label="Timestamp (YYYY-MM-DDTHH:MM:SS)"
            type="text"
            fullWidth
            variant="standard"
            value={newAttendanceTimestamp}
            onChange={(e) => setNewAttendanceTimestamp(e.target.value)}
            className="modern-input"
          />
        </DialogContent>
        <DialogActions>
          <button
            className="modern-button"
            onClick={() => setOpenEditAttendance(false)}
          >
            Cancel
          </button>
          <button className="modern-button" onClick={handleUpdateAttendance}>
            Update
          </button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function ChatbotInterface() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Hello! How can I help you with attendance today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newHistory = [...chatHistory, { sender: "user", text: query }];
    setChatHistory(newHistory);
    setQuery("");
    setLoading(true);

    const result = await queryChatbot(query);

    let botResponse = "Sorry, something went wrong.";
    if (!result.error) {
      botResponse = result.response;
    }

    setChatHistory([...newHistory, { sender: "bot", text: botResponse }]);
    setLoading(false);
  };

  return (
    <Box sx={{ my: 2 }} className="glass-card">
      <Typography variant="h5" gutterBottom>
        Chatbot Assistant
      </Typography>
      <div className="chatbot-container">
        <div className="chat-history">
          {chatHistory.map((message, index) => (
            <div key={index} className={`chat-message ${message.sender}`}>
              {message.text}
            </div>
          ))}
          {loading && <div className="chat-message bot">...</div>}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="chat-input-form">
          <TextField
            label="Ask me about attendance..."
            variant="outlined"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="modern-input"
            disabled={loading}
            sx={{ mr: 1 }} // Add some right margin to the TextField
          />
          <Button
            type="submit"
            variant="contained"
            className="modern-button"
            disabled={loading}
            sx={{ height: "56px" }} // Match height of TextField
          >
            <SendIcon />
          </Button>
        </form>
      </div>
    </Box>
  );
}

export default App;
