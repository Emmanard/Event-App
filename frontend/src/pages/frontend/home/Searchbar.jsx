import { DatePicker, Input, Select } from "antd";
import React from "react";

export default function Searchbar() {
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  return (
    <div id="searchbar-section">
      <div className="container">
        <div className="card p-4 p-sm-5 rounded-pill border-0 shadow-lg">
          <form>
            <div className="row g-3 d-flex justify-content-center">
              <div className="col-12 col-sm-6 col-lg-3">
                <Input placeholder="Enter Location..." />
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <DatePicker size="large" />
              </div>
              <div className="col-12  col-lg-3">
                <Select
                  showSearch
                  placeholder="Category"
                  optionFilterProp="children"
                  // onSearch={onSearch}
                  filterOption={filterOption}
                  options={[
                    {
                      value: "jack",
                      label: "Jack",
                    },
                    {
                      value: "lucy",
                      label: "Lucy",
                    },
                    {
                      value: "tom",
                      label: "Tom",
                    },
                  ]}
                />
              </div>
              <div className="col-12  col-lg-2">
                <button className="button-stylling rounded bg-warning border-0">
                  <span className="text">Search Now</span>
                  <span>Discover</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
