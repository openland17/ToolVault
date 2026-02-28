"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Download,
  Moon,
  Sun,
  Trash2,
  Upload,
  User,
  Info,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { defaultUserProfile } from "@/lib/mock-data";
import { NotificationPrefs, UserProfile } from "@/lib/types";

const PROFILE_KEY = "toolvault-profile";
const THEME_KEY = "toolvault-theme";

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return defaultUserProfile;
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return defaultUserProfile;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [darkMode, setDarkMode] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    const savedTheme = localStorage.getItem(THEME_KEY);
    setDarkMode(savedTheme !== "light");
    setMounted(true);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  };

  const updateNotification = (key: keyof NotificationPrefs, value: boolean) => {
    updateProfile({
      notifications: { ...profile.notifications, [key]: value },
    });
    toast({ title: "Settings saved", description: `Notification preference updated.` });
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    toast({ title: "Settings saved", description: `${next ? "Dark" : "Light"} mode enabled.` });
  };

  const handleClearAll = () => {
    localStorage.removeItem("toolvault-tools");
    localStorage.removeItem(PROFILE_KEY);
    setClearDialogOpen(false);
    toast({
      title: "Data cleared",
      description: "All tool data has been removed.",
    });
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <Field
            label="Name"
            value={profile.name}
            onChange={(v) => updateProfile({ name: v })}
          />
          <Field
            label="Email"
            value={profile.email}
            onChange={(v) => updateProfile({ email: v })}
          />
          <Field
            label="Location"
            value={profile.location}
            onChange={(v) => updateProfile({ location: v })}
          />
          <Button
            size="sm"
            className="bg-amber-accent text-zinc-900 hover:bg-amber-accent/90 mt-2"
            onClick={() => toast({ title: "Profile saved" })}
          >
            Save Profile
          </Button>
        </Section>

        <Separator className="bg-zinc-800" />

        {/* Notifications */}
        <Section icon={Bell} title="Notifications">
          <p className="text-xs text-zinc-500 mb-3">
            Warranty expiry reminders
          </p>
          <div className="space-y-3">
            <ToggleRow
              label="90 days before expiry"
              checked={profile.notifications.days90}
              onChange={(v) => updateNotification("days90", v)}
            />
            <ToggleRow
              label="30 days before expiry"
              checked={profile.notifications.days30}
              onChange={(v) => updateNotification("days30", v)}
            />
            <ToggleRow
              label="7 days before expiry"
              checked={profile.notifications.days7}
              onChange={(v) => updateNotification("days7", v)}
            />
            <ToggleRow
              label="On expiry date"
              checked={profile.notifications.onExpiry}
              onChange={(v) => updateNotification("onExpiry", v)}
            />
            <ToggleRow
              label="Tips & updates"
              checked={profile.notifications.tips}
              onChange={(v) => updateNotification("tips", v)}
            />
          </div>
        </Section>

        <Separator className="bg-zinc-800" />

        {/* Appearance */}
        <Section icon={darkMode ? Moon : Sun} title="Appearance">
          <ToggleRow
            label="Dark mode"
            checked={darkMode}
            onChange={toggleTheme}
          />
        </Section>

        <Separator className="bg-zinc-800" />

        {/* Data */}
        <Section icon={Download} title="Data">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-zinc-700 text-zinc-300 justify-start"
              onClick={() =>
                toast({
                  title: "Data exported",
                  description: "Tool data has been exported.",
                })
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Tool Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-zinc-700 text-zinc-300 justify-start"
              onClick={() =>
                toast({
                  title: "Import",
                  description: "Import functionality coming soon.",
                })
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>

            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-status-expired/30 text-status-expired hover:bg-status-expired/10 justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle>Clear all data?</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    This will remove all your tools, receipts, and warranty
                    information. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    className="border-zinc-700"
                    onClick={() => setClearDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-status-expired text-white hover:bg-status-expired/90"
                    onClick={handleClearAll}
                  >
                    Clear All Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Section>

        <Separator className="bg-zinc-800" />

        {/* About */}
        <Section icon={Info} title="About">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Version</span>
              <span className="text-zinc-300">1.0.0 MVP</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-500 text-xs mt-3">
              Built with <Heart className="h-3 w-3 text-status-expired inline" /> for
              Aussie tradies
            </div>
            <div className="flex gap-4 mt-2">
              <button className="text-xs text-zinc-500 hover:text-zinc-300">
                Privacy Policy
              </button>
              <button className="text-xs text-zinc-500 hover:text-zinc-300">
                Terms
              </button>
              <button className="text-xs text-zinc-500 hover:text-zinc-300">
                Contact Support
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-amber-accent" />
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-900 border-zinc-700 text-zinc-200 h-9 text-sm"
      />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-300">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
