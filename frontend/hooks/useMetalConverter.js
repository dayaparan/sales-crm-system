import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";

export const useMetalConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [metalPrices, setMetalPrices] = useState([]);
  const [metalCurrency, setMetalCurrency] = useState("USD");
  const [metalAmount, setMetalAmount] = useState(10);
  const [metalFromCurrency, setMetalFromCurrency] = useState("USD");
  const [selectedMetal, setSelectedMetal] = useState("XAU");
  const [metalResult, setMetalResult] = useState(null);
  const [metalMetadata, setMetalMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [metalTable, setMetalTable] = useState([]);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available currencies and metals on mount
  useEffect(() => {
    const fetchCurrenciesAndMetals = async () => {
      setIsLoading(true);
      try {
        const [currencyResponse, metalResponse] = await Promise.all([
          axiosInstance.get("/website/currency"),
          axiosInstance.get("/website/metal", { params: { currency: metalCurrency } }),
        ]);

        if (currencyResponse.data.success) {
          setCurrencies(currencyResponse.data.currencies);
        } else {
          setError("Failed to load currencies");
        }

        if (metalResponse.data.success) {
          setMetalPrices(metalResponse.data.metalPrices);
        } else {
          setError("Failed to load metal prices");
        }
      } catch (err) {
        setError("Error fetching currencies or metal prices");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrenciesAndMetals();
  }, []);

  // Fetch metal prices when metalCurrency changes
  useEffect(() => {
    const fetchMetalPrices = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/website/metal", {
          params: { currency: metalCurrency },
        });
        if (response.data.success) {
          setMetalPrices(response.data.metalPrices);
        } else {
          setError("Failed to load metal prices");
        }
      } catch (err) {
        setError("Error fetching metal prices");
      } finally {
        setIsLoading(false);
      }
    };
    if (metalCurrency) fetchMetalPrices();
  }, [metalCurrency]);

  // Fetch metal conversion when metalFromCurrency or selectedMetal changes
  useEffect(() => {
    const fetchMetalConversion = async () => {
      if (!metalFromCurrency || !selectedMetal) return;
      setIsLoading(true);

      try {
        const response = await axiosInstance.get("/website/metal/convert", {
          params: { amount: metalAmount, currency: metalFromCurrency, metalCode: selectedMetal },
        });
        if (response.data.success) {
          setMetalResult(response.data.result);
          setMetalMetadata(response.data.metadata);
          setFetchedAt(response.data.fetchedAt);
          setError(null);
          calculateMetalConversion(metalAmount, response.data.metadata);
        } else {
          setError(response.data.message || "Failed to fetch metal conversion");
          setMetalResult(null);
          setMetalMetadata(null);
          setMetalTable([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching metal conversion");
        setMetalResult(null);
        setMetalMetadata(null);
        setMetalTable([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetalConversion();
  }, [metalFromCurrency, selectedMetal]);

  // Perform client-side metal conversion
  const calculateMetalConversion = (amt, metadata) => {
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount for metal conversion");
      setMetalResult(null);
      setMetalTable([]);
      return;
    }

    const price = parseFloat(metadata?.metal?.price.toString());
    if (!price || price === 0) {
      setError(`Price for ${metadata?.metal?.code || "selected metal"} not available or zero`);
      setMetalResult(null);
      setMetalTable([]);
      return;
    }

    const quantity = (amt / price).toFixed(6);
    setMetalResult(quantity);
    setError(null);

    // Generate metal conversion table
    const amounts = [1, 5, 10, 25, 50, 100, 500, 1000, 5000, 10000];
    const table = amounts.map((val) => ({
      amount: val,
      converted: price !== 0 ? (val / price).toFixed(6) : "N/A",
    }));
    setMetalTable(table);
  };

  // Perform client-side calculations when metalAmount changes
  useEffect(() => {
    if (metalMetadata) {
      calculateMetalConversion(metalAmount, metalMetadata);
    }
  }, [metalAmount, metalMetadata]);

  return {
    currencies,
    metalPrices,
    metalCurrency,
    setMetalCurrency,
    metalAmount,
    setMetalAmount,
    metalFromCurrency,
    setMetalFromCurrency,
    selectedMetal,
    setSelectedMetal,
    metalResult,
    metalMetadata,
    error,
    metalTable,
    fetchedAt,
    isLoading,
  };
};
