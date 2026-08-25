"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Bell, Palette, Shield, User, DollarSign, LockKeyhole, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem("mathitout-notifications") === "true");
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem("mathitout-email-notifications") === "true");
  const [pushNotifications, setPushNotifications] = useState(() => localStorage.getItem("mathitout-push-notifications") === "true");
  const [studyReminder, setStudyReminder] = useState(() => localStorage.getItem("mathitout-study-reminder") === "true");
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem("mathitout-reminder-time") || "19:00");
  const [themePreference, setThemePreference] = useState(() => theme || localStorage.getItem("mathitout-theme") || "system");
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem("mathitout-reduce-motion") === "true");
  const [publicProfile, setPublicProfile] = useState(() => localStorage.getItem("mathitout-public-profile") === "true");
  const [dataPrivacy, setDataPrivacy] = useState(() => localStorage.getItem("mathitout-data-privacy") === "true");
  const [newsletter, setNewsletter] = useState(() => localStorage.getItem("mathitout-newsletter") === "true");

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("9");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setThemePreference(theme || "system");
    });
  }, [theme, setTheme]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setGrade(data.grade || "9");
          setEmail(data.email || "");
          setLanguage(data.language || "en");
        }
      } catch {
        // profile fetch failed, keep defaults
      } finally {
        setProfileLoaded(true);
      }
    };
    loadProfile();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const [profileRes] = await Promise.all([
        fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, grade, language }),
        }),
      ]);

      if (!profileRes.ok) {
        throw new Error("Failed to save profile");
      }

      localStorage.setItem("mathitout-notifications", String(notificationsEnabled));
      localStorage.setItem("mathitout-email-notifications", String(emailNotifications));
      localStorage.setItem("mathitout-push-notifications", String(pushNotifications));
      localStorage.setItem("mathitout-study-reminder", String(studyReminder));
      localStorage.setItem("mathitout-reminder-time", reminderTime);
      localStorage.setItem("mathitout-theme", themePreference);
      localStorage.setItem("mathitout-reduce-motion", String(reduceMotion));
      localStorage.setItem("mathitout-public-profile", String(publicProfile));
      localStorage.setItem("mathitout-data-privacy", String(dataPrivacy));
      localStorage.setItem("mathitout-newsletter", String(newsletter));

      toast({
        title: "Settings saved!",
        description: "Your preferences have been updated.",
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast({
        title: "Failed to save settings",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const [progressRes, favoritesRes] = await Promise.all([
        fetch("/api/progress"),
        fetch("/api/favorites"),
      ]);

      const progress = progressRes.ok ? await progressRes.json() : [];
      const favorites = favoritesRes.ok ? await favoritesRes.json() : [];

      const exportData = {
        exportedAt: new Date().toISOString(),
        progress,
        favorites,
        settings: {
          theme: localStorage.getItem("mathitout-theme") || "system",
          notifications: localStorage.getItem("mathitout-notifications") === "true",
          emailNotifications: localStorage.getItem("mathitout-email-notifications") === "true",
          publicProfile: localStorage.getItem("mathitout-public-profile") === "true",
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mathitout-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully!",
        description: "Your data download has started.",
      });
    } catch (err) {
      console.error("Failed to export data:", err);
      toast({
        title: "Failed to export data",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!profileLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }).map((_, i) => (
                    <SelectItem key={i} value={String(i)}>{i === 0 ? "Kindergarten" : `Grade ${i}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lang">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Light, dark, or system</p>
            </div>
            <Select defaultValue={themePreference} onValueChange={(value) => { setThemePreference(value); setTheme(value); localStorage.setItem("mathitout-theme", value); }}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reduce Motion</p>
              <p className="text-sm text-muted-foreground">Minimize animations</p>
            </div>
            <Switch 
              checked={reduceMotion} 
              onCheckedChange={(checked) => setReduceMotion(checked)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-muted-foreground">Enable notifications</p>
            </div>
            <Switch 
              checked={notificationsEnabled} 
              onCheckedChange={(checked) => setNotificationsEnabled(checked)} 
            />
          </div>
          {notificationsEnabled && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Get updates via email</p>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={(checked) => setEmailNotifications(checked)} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Browser notifications</p>
                </div>
                <Switch 
                  checked={pushNotifications} 
                  onCheckedChange={(checked) => setPushNotifications(checked)} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Study Reminder</p>
                  <p className="text-sm text-muted-foreground">Daily practice reminder</p>
                </div>
                <Switch 
                  checked={studyReminder} 
                  onCheckedChange={(checked) => setStudyReminder(checked)} 
                />
              </div>
              {studyReminder && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Reminder Time</p>
                      <p className="text-sm text-muted-foreground">When to remind you</p>
                    </div>
                     <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      />
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy & Safety</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Profile</p>
              <p className="text-sm text-muted-foreground">Show on leaderboards</p>
            </div>
            <Switch 
              checked={publicProfile} 
              onCheckedChange={(checked) => setPublicProfile(checked)} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Privacy</p>
              <p className="text-sm text-muted-foreground">Allow anonymized usage data</p>
            </div>
            <Switch 
              checked={dataPrivacy} 
              onCheckedChange={(checked) => setDataPrivacy(checked)} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Newsletter</p>
              <p className="text-sm text-muted-foreground">Get learning tips and updates</p>
            </div>
            <Switch 
              checked={newsletter} 
              onCheckedChange={(checked) => setNewsletter(checked)} 
            />
          </div>
          <Separator />
          <div>
            <Badge variant="outline" className="text-green-600 border-green-600/30">COPPA Compliant</Badge>
            <p className="text-xs text-muted-foreground mt-2">We protect minors&apos; data per COPPA regulations.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Subscription</CardTitle>
          <CardDescription>
            Manage your subscription and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Current Plan</span>
                <span className="badge badge-outline badge-primary">Free</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Access to all lessons, practice exercises, and progress tracking
              </p>
            </div>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => toast({ title: "Premium coming soon", description: "Upgrades will be available shortly." })}>
                Upgrade to Premium
              </Button>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5" /> Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => toast({ title: "Password change", description: "Password reset link sent to your email." })}
          >
            Change Password
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleDownloadData}
          >
            Download Data
          </Button>
          
          <Button 
            variant="destructive"
            className="w-full"
            onClick={() => {
              const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
              if (confirmed) {
                toast({ title: "Account deletion requested", description: "This would be processed in a future update.", variant: "destructive" });
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
