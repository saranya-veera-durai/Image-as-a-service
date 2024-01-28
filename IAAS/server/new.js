import React, { useState, useEffect } from "react";
import Logout from "./logout";
export default function Upload({ userId, userFolderKey, isLoggedIn, useremail, handleLogout }) {
  const folder_key = userFolderKey;
  const [folderKey, setFolderKey] = useState(folder_key);
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [allimages,setAllimages]=useState([]);
  const user_id = userId;
  const imagepath = folderKey ? folderKey.replace(/\|\|/g, "/") : "";

  useEffect(() => {
    setAllimages(images)
  });

  useEffect(() => {
    fetchData();
  }, [folderKey]);

  const fetchData = async () => {
    try {
      const [folderData, imageData] = await Promise.all([
        fetch(`http://127.0.0.1:5003/allfolders/${user_id}/${folderKey}`).then(response => response.json()),
        fetch(`http://127.0.0.1:5003/allimages/${user_id}/${folderKey}`).then(response => response.json())
      ]);

      const nextEndpointsArray = folderData.subfolders.map(subfolder => {
        const news = subfolder.split("/");
        const data = news.length;
        let nextendpoint = "";
        for (let i = 2; i <= data; i++) {
          nextendpoint = nextendpoint + "||" + news[i - 1];
        }
        return nextendpoint;
      });

      const uniqueArray = [...new Set(nextEndpointsArray)];
      setFolders(uniqueArray.filter(subfolder => subfolder.split("||").length <= 2));
      setImages(imageData.subfolders);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5003/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          folders: `${imagepath}/${newFolderName}`,
        }),
      });

      const data = await response.json();
      alert('Folder created successfully:', data);
      setNewFolderName(""); // Clear the input field
      fetchData(); // Fetch updated data
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const uploadImage = async () => {
    const userId = user_id;
    const folderKey = imagepath;
    const imageFileInput = document.getElementById('imageFile');
    const imageFile = imageFileInput.files[0];

    if (userId && imageFile) {
      try {
        const formData = new FormData();
        formData.append('images', imageFile);
        formData.append('user_id', userId);
        formData.append('folder_key', folderKey);

        const response = await fetch('http://127.0.0.1:5003/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        alert("Image uploaded successfully!!!!");
        fetchData(); // Fetch updated data

      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.error('Please provide both user ID and image file.');
    }
  };

  const handleFolderClick = (data) => {
    const updatedFolderKey = folderKey + data;
    setFolderKey(updatedFolderKey);
  };

  return (
    <div className="container fw-bold mt-1" style={{ fontFamily: "georgia", fontSize: "15px" }}>
      <Logout
        isLoggedIn={isLoggedIn}
        useremail={useremail}
        handleLogout={handleLogout} />
      <hr />

      <div className="d-flex justify-content-between">
        <h5>{folderKey ? folderKey.replace(/\|\|/g, " >> ").replace(folder_key, "Root") : ""}</h5>
        <button
          onClick={() => {
            const parts = folderKey.split("||");
            parts.pop();
            const updatedFolderKey = parts.join("||");
            setFolderKey(updatedFolderKey);
          }}
          disabled={folderKey === folder_key}
          className="w-25"
          style={{ backgroundColor: folderKey === folder_key ? '#adadad' : '#4caf50' }} // Customize the background color for the disabled state
        >
          &lt;&lt; Back
        </button>
      </div>
      <form onSubmit={handleFolderSubmit} className="d-flex justify-content-between">
        <div>
          <label htmlFor="newFolderName">New Folder Name:</label>
          <input
            type="text"
            id="newFolderName"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-danger w-25">Create Folder</button>
      </form>


      <div style={{ maxHeight: "250px", overflowY: "auto" }}
      >
        <table id="data-table">
          <thead>
            <tr>
              <th>Filtered Data</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody >
            {folders.map((data, index) => (
              <tr key={index}>
                <td>{data.replace("||", "")}</td>
                <td>
                  <button onClick={() => handleFolderClick(data)} className="p-1 m-0">Click me</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <form id="imageUploadForm" className="d-flex justify-content-between pt-4">
        <div>
          <label htmlFor="imageFile">Image File:</label>
          <input type="file" id="imageFile" name="imageFile" accept="image/*" required />
          <br />
        </div>
        <button type="button" className="btn-danger w-25" onClick={uploadImage}>Upload</button>
        <p>&nbsp;</p>
        <button type="button" className="btn-danger w-25" onClick={()=>window.location.href = `http://127.0.0.1:5003/getimgeApis/${allimages.join(',')}`}>allApis</button>
      </form>
      <div style={{ maxHeight: "250px", overflowY: "auto" }}>
        <table id="data-table-image">
          <thead>
            <tr>
              <th>Filtered Data</th>
              <th>Download</th>
              <th>API</th>
            </tr>
          </thead>
          <tbody>
            {images.map((data, index) => (
              <tr key={index}>
                <td>{data.replace("||", "")}</td>
                <td>
                  <button  className="p-1 m-0" onClick={()=>window.location.href = `http://127.0.0.1:5003/downloadImg/${data.replace("||", "")}`}>Download</button>
                </td>
                <td>
                  <button  className="p-1 m-0" onClick={()=>window.location.href = `http://127.0.0.1:5003/getimge/${data.replace("||", "")}`}>API</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}