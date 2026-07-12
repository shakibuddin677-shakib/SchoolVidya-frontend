import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// createAsyncThunk(name, callback) - Redux Toolkit khud "loginUser.pending",
// "loginUser.fulfilled", "loginUser.rejected" jaise action types bana deta hai
export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post("/auth/login", credentials);
    return data.user; // backend { success, message, token, user } bhejta hai - hume sirf user chahiye
  } catch (error) {
    // rejectWithValue se hum apna custom error message slice tak pahuncha sakte hain
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/auth/check-auth");
    return data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Not authenticated");
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await axiosInstance.get("/auth/logout");
});

// Profile picture upload - student/teacher/admin sab apna khud ka avatar
// update kar sakte hain. Backend: PUT /api/users/:id/avatar (multipart)
export const updateAvatar = createAsyncThunk("auth/updateAvatar", async ({ userId, file }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    // Content-Type header manually set NAHI karte - browser khud "boundary"
    // ke saath multipart/form-data set kar deta hai FormData dekh ke
    const { data } = await axiosInstance.put(`/users/${userId}/avatar`, formData);
    return data.data; // { public_id, url }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to upload photo");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // { _id, name, email, role, avatar }
    isAuthenticated: false,
    loading: true, // shuru mein "true" - checkAuth chal raha hota hai app load pe
    error: null,
  },
  reducers: {},
  // extraReducers - dusre slices/thunks ke actions ko yahan "sunte" hain
  extraReducers: (builder) => {
    builder
      // ---- LOGIN ----
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // ---- CHECK AUTH (app load pe "already logged in?" check) ----
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // ---- LOGOUT ----
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // ---- UPDATE AVATAR ---- (Topbar mein turant reflect ho jaaye,
      // bina page reload ya re-login ke)
      .addCase(updateAvatar.fulfilled, (state, action) => {
        if (state.user) state.user.avatar = action.payload;
      });
  },
});

export default authSlice.reducer;
