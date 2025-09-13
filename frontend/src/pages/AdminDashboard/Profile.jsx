import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/slices/authSlice";
import ProfileForm from "../../components/forms/ProfileForm";
import { User, Settings, Shield, Crown } from "lucide-react";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only fetch profile if user data is not already available
    if (!user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  if (loading && !user) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">My Admin Profile</h1>
      {user ? <ProfileForm user={user} /> : <p>No profile data found.</p>}
    </div>
  );
};

export default Profile;
