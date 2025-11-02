const API_URL = process.env.REACT_APP_API_URL;

export const submitIndividualForm = async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/individual-registration`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "สมัครไม่สำเร็จ");
    }

    return await response.json();
};
