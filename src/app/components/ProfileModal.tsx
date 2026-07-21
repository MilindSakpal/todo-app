import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
} from "lucide-react";

import { useEffect, useState } from "react";

interface Profile {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
}

interface Props {
  open: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => void;
}

export default function ProfileModal({
  open,
  profile,
  onClose,
  onSave,
}: Props) {

  const [form, setForm] = useState(profile);

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  useEffect(() => {
    setForm(profile);
  }, [profile, open]);

  if (!open) return null;

  const handleChange = (
    key: keyof Profile,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone: string) =>
    /^[0-9]{10}$/.test(phone);

  const handleSave = () => {
    const newErrors = {
      email: "",
      phone: "",
    };

    if (!validateEmail(form.email)) {
      newErrors.email = "Invalid email address.";
    }

    if (!validatePhone(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.phone) return;

    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">

        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold">
            Profile Settings
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-6 space-y-5">

          <Input
            icon={<User size={16}/>}
            label="Full Name"
            value={form.name}
            onChange={(v)=>handleChange("name",v)}
          />

          <Input
            icon={<Mail size={16}/>}
            label="Email"
            value={form.email}
            onChange={(v)=>handleChange("email",v)}
          />

          {errors.email && (
            <p className="text-red-500 text-xs">
              {errors.email}
            </p>
          )}

          <div>
            <label className="block mb-1 text-sm">
              Phone Number
            </label>

            <div className="flex items-center border rounded-xl px-3">

              <Phone size={16}/>

              <input
                value={form.phone}
                maxLength={10}
                onChange={(e)=>
                  handleChange(
                    "phone",
                    e.target.value.replace(/\D/g,"")
                  )
                }
                className="w-full p-3 outline-none"
              />

            </div>

            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          <Input
            icon={<Building2 size={16}/>}
            label="Department"
            value={form.department}
            onChange={(v)=>handleChange("department",v)}
          />

          <Input
            icon={<Briefcase size={16}/>}
            label="Designation"
            value={form.designation}
            onChange={(v)=>handleChange("designation",v)}
          />

        </div>

        <div className="flex justify-end gap-3 p-5 border-t bg-slate-50">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}

interface InputProps{
  label:string;
  value:string;
  onChange:(value:string)=>void;
  icon:React.ReactNode;
}

function Input({
  label,
  value,
  onChange,
  icon,
}:InputProps){

  return(
    <div>

      <label className="block mb-1 text-sm">
        {label}
      </label>

      <div className="flex items-center border rounded-xl px-3">

        {icon}

        <input
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          className="w-full p-3 outline-none"
        />

      </div>

    </div>
  )
}