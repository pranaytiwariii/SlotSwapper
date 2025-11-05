"use client";

import { useState, useEffect } from "react";
import CalendarGrid from "@/components/calendar-grid";
import TeamSelector from "@/components/team-selector";
import {
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  Calendar,
  Users,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  taskIds?: string[];
}

interface Task {
  _id: string;
  userId: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  description?: string;
  createdAt?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  taskIds: string[];
  taskDetails: Task[];
  createdAt: string;
}

export default function Home() {
  const [showInfo, setShowInfo] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [otherUsersTasks, setOtherUsersTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedTaskForSwap, setSelectedTaskForSwap] = useState<Task | null>(
    null
  );

  // Auth form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Task form states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskStart, setNewTaskStart] = useState("");
  const [newTaskEnd, setNewTaskEnd] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadTasks(savedToken);
      loadUserProfile(savedToken);
      loadOtherUsersTasks(savedToken);
    }
  }, []);

  const loadTasks = async (authToken: string) => {
    try {
      const response = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.ok) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const loadUserProfile = async (authToken: string) => {
    try {
      const response = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.ok) {
        setUserProfile(data.user);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  };

  const loadOtherUsersTasks = async (authToken: string) => {
    try {
      // In a real app, you'd have an endpoint to get other users' tasks
      // For demo, we'll seed data and then filter out current user's tasks
      const allTasksResponse = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const allTasksData = await allTasksResponse.json();

      if (allTasksData.ok && user) {
        // Filter to get tasks from other users (for swap demo)
        const otherTasks = allTasksData.tasks.filter(
          (task: Task) => task.userId !== user.id
        );
        setOtherUsersTasks(otherTasks);
      }
    } catch (err) {
      console.error("Failed to load other users tasks:", err);
    }
  };

  const loadAllTasks = async () => {
    try {
      // Seed demo data
      const response = await fetch("/api/dev/seed", { method: "POST" });
      if (response.ok) {
        // Re-load all data after seeding
        if (token) {
          await loadTasks(token);
          await loadUserProfile(token);
          await loadOtherUsersTasks(token);
        }
      }
    } catch (err) {
      console.error("Failed to seed data:", err);
    }
  };

  const handleSwapTask = async (myTaskId: string, otherTaskId: string) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("/api/tasks/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          myTaskId: myTaskId,
          otherTaskId: otherTaskId,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        // Reload all data to reflect the swap
        await loadTasks(token);
        await loadUserProfile(token);
        await loadOtherUsersTasks(token);
        setShowSwapModal(false);
        setSelectedTaskForSwap(null);
      } else {
        setError(data.error || "Failed to swap tasks");
      }
    } catch (err) {
      setError("Failed to swap tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setEmail("");
        setPassword("");
        await loadTasks(data.token);
        await loadUserProfile(data.token);
        await loadOtherUsersTasks(data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (data.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setName("");
        setEmail("");
        setPassword("");
        await loadTasks(data.token);
        await loadUserProfile(data.token);
        await loadOtherUsersTasks(data.token);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setTasks([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          date: newTaskDate,
          start: newTaskStart || undefined,
          end: newTaskEnd || undefined,
          description: newTaskDesc || undefined,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        // Reload all data to reflect the new task in user profile too
        await loadTasks(token);
        await loadUserProfile(token);
        await loadOtherUsersTasks(token);
        setNewTaskTitle("");
        setNewTaskDate("");
        setNewTaskStart("");
        setNewTaskEnd("");
        setNewTaskDesc("");
      } else {
        setError(data.error || "Failed to add task");
      }
    } catch (err) {
      setError("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token || !confirm("Are you sure you want to delete this task?"))
      return;

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.ok) {
        // Reload all data to reflect the deletion in user profile too
        await loadTasks(token);
        await loadUserProfile(token);
        await loadOtherUsersTasks(token);
      } else {
        setError(data.error || "Failed to delete task");
      }
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-background text-foreground p-8">
        <div className="max-w-md mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary text-balance">
              SlotSwapper
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Swap tasks and manage schedules with your team
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="alice@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="secret123"
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      <LogIn className="mr-2 h-4 w-4" />
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Alice Johnson"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="alice@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Choose a strong password"
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo accounts:</p>
            <p>alice@example.com / secret123</p>
            <p>bob@example.com / secret456</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllTasks}
              className="mt-2"
            >
              <Users className="mr-2 h-4 w-4" />
              Seed Demo Data
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary text-balance">
              Welcome, {user.name}!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage your tasks and swap schedules
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{user.email}</Badge>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Users className="mr-2 h-4 w-4" />
              My Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="add-task">Add Task</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <div className="mb-8">
              <TeamSelector />
            </div>
            <CalendarGrid />
          </TabsContent>

          <TabsContent value="tasks">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Your Tasks</h2>
                <Button
                  onClick={() => loadTasks(token!)}
                  variant="outline"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>

              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No tasks yet. Add your first task to get started!</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tasks.map((task) => (
                    <Card key={task._id}>
                      <CardHeader>
                        <CardTitle className="flex justify-between items-start">
                          <span>{task.title}</span>
                          <Badge variant="outline">{task.date}</Badge>
                        </CardTitle>
                        {task.description && (
                          <CardDescription>{task.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              {task.start
                                ? `${task.start} - ${task.end}`
                                : "All day"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTaskForSwap(task);
                                setShowSwapModal(true);
                              }}
                            >
                              Request Swap
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="add-task">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
                <CardDescription>
                  Create a task for your calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      required
                      placeholder="Meeting with team"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-date">Date</Label>
                    <Input
                      id="task-date"
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="task-start">Start Time</Label>
                      <Input
                        id="task-start"
                        type="time"
                        value={newTaskStart}
                        onChange={(e) => setNewTaskStart(e.target.value)}
                        placeholder="09:00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-end">End Time</Label>
                      <Input
                        id="task-end"
                        type="time"
                        value={newTaskEnd}
                        onChange={(e) => setNewTaskEnd(e.target.value)}
                        placeholder="10:00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="task-desc">Description (Optional)</Label>
                    <Input
                      id="task-desc"
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Meeting details..."
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Adding..." : "Add Task"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-accent hover:text-primary transition-colors font-semibold"
          >
            How to use
            <ChevronDown
              size={18}
              className={`transition-transform ${showInfo ? "rotate-180" : ""}`}
            />
          </button>
          {/* Swap Modal */}
          {showSwapModal && selectedTaskForSwap && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Swap Task</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSwapModal(false);
                      setSelectedTaskForSwap(null);
                    }}
                  >
                    ×
                  </Button>
                </div>

                <div className="mb-4 p-3 bg-muted rounded">
                  <p className="text-sm font-medium">Your Task:</p>
                  <p className="font-semibold">{selectedTaskForSwap.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTaskForSwap.date} •{" "}
                    {selectedTaskForSwap.start
                      ? `${selectedTaskForSwap.start} - ${selectedTaskForSwap.end}`
                      : "All day"}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">
                    Select task to swap with:
                  </p>
                  {otherUsersTasks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No other users' tasks available for swapping.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {otherUsersTasks.map((task) => (
                        <div
                          key={task._id}
                          className="p-3 border border-border rounded cursor-pointer hover:bg-muted"
                          onClick={() => {
                            if (selectedTaskForSwap) {
                              handleSwapTask(selectedTaskForSwap._id, task._id);
                            }
                          }}
                        >
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.date} •{" "}
                            {task.start
                              ? `${task.start} - ${task.end}`
                              : "All day"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Owner: {task.userId}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showInfo && (
            <div className="mt-4 bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="text-muted-foreground">
                ✓ Use the "My Tasks" tab to view and manage your tasks
              </p>
              <p className="text-muted-foreground">
                ✓ Add new tasks using the "Add Task" tab
              </p>
              <p className="text-muted-foreground">
                ✓ Click "Request Swap" on tasks to swap with other team members
              </p>
              <p className="text-muted-foreground">
                ✓ Use the Calendar view to see tasks visually by date
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
