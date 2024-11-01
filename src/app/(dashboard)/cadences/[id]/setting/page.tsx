"use client";

import { useEffect, useState } from "react";

import { Formik } from "formik";
import * as Yup from "yup";

import { BaseCadenceModel, updateCadence } from "@/services/cadenceService";
import { getUsers } from "@/services/userService";
import { handleError, runService } from "@/utils/service_utils";
import Select from "@/components/extends/Select/default";
import { useCadence } from "@/contexts/CadenceContext";
import FormHelperText from "@/components/extends/FormHelperText";

export default function Page() {
  const { cadence, setCadence } = useCadence();
  const [userOptions, setUserOptions] = useState<any[]>([]);

  const handleUpdateCadence = (updatedCadence: BaseCadenceModel) => {
    console.log("handleUpdateCadence: ", updatedCadence);
    runService(
      { cadenceId: cadence?.id, updatedCadence },
      updateCadence,
      (data) => {
        setCadence(data);
        console.log("cadence: ", data);
      },
      (status, error) => {
        console.log(status, error);
        handleError(status, error);
      }
    );
  };

  const fetchUsers = () => {
    runService(
      undefined,
      getUsers,
      (data: any[]) => {
        const tempUserOptions = data.map((user) => {
          return {
            name: user.firstName + " " + user.lastName,
            value: user.id,
          };
        });
        setUserOptions(tempUserOptions);
      },
      (status, error) => {
        handleError(status, error);
      }
    );
  };
  console.log("cadence: ", cadence);
  console.log("userOptions: ", userOptions);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="p-4 flex flex-1 bg-gray-100 overflow-auto text-sm">
          <div className="card flex flex-1 justify-center items-center bg-white">
            <div className="card py-8 max-w-lg min-h-96 w-full flex flex-col gap-5 border shadow-lg">
              <div className="change-password-header">
                <h1 className="text-lg">Account Profile</h1>
                <hr />
              </div>
              <div className="flex-1 p-4 mt-4 flex flex-col gap-2 border rounded">
                <Formik
                  initialValues={{
                    name: cadence ? cadence.name : "",
                    ownerId: cadence ? cadence.ownerId : "",
                  }}
                  validationSchema={Yup.object().shape({
                    name: Yup.string().required("Cadence name is required"),
                    ownerId: Yup.string().required("Assignee is required"),
                  })}
                  onSubmit={async (values, { setSubmitting }) => {
                    setSubmitting(true);
                    handleUpdateCadence({
                      name: values.name,
                      ownerId: values.ownerId,
                    });
                    setSubmitting(false);
                  }}
                  enableReinitialize={true}
                >
                  {({
                    errors,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                    isSubmitting,
                    touched,
                    values,
                  }) => {
                    return (
                      <form
                        noValidate
                        onSubmit={handleSubmit}
                        className="flex-1 flex flex-col gap-2"
                      >
                        <div className="flex flex-col gap-1">
                          <label htmlFor="name" className="text-xs">
                            Name:
                          </label>
                          <input
                            id="name"
                            type="text"
                            placeholder="Name"
                            className="input-primary max-h-9"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {touched.name && errors.name && (
                            <FormHelperText>{errors.name}</FormHelperText>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label htmlFor="ownerId" className="text-xs">
                            Owner:
                          </label>
                          <Select
                            data={userOptions}
                            // defaultValue={userOptions.find(
                            //   (option) => option.value === values.ownerId
                            // )}
                            onChange={(selectedItem) => {
                              if (
                                selectedItem &&
                                selectedItem.value !== values.ownerId
                              )
                                setFieldValue("ownerId", selectedItem.value);
                            }}
                          ></Select>
                          {touched.ownerId && errors.ownerId && (
                            <FormHelperText>{errors.ownerId}</FormHelperText>
                          )}
                        </div>
                        <div className="flex-1" />
                        <div className="pt-2 flex justify-end gap-4">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
