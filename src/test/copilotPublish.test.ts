// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { should, use } from "chai";
import { stubInterface } from "ts-sinon";
import * as sinonChai from "sinon-chai";
import rewiremock from "./rewiremock";
import { stub } from "sinon";
import { UsernamePassword } from "@microsoft/powerplatform-cli-wrapper";
import { runnerParameters } from "../lib/runnerParameters";
import Sinon = require("sinon");
import { ActionsHost } from "../lib/host/ActionsHost";
should();
use(sinonChai);

describe("copilot-publish tests", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const copilotPublishStub: Sinon.SinonStub<any[], any> = stub();
    const credentials: UsernamePassword = stubInterface<UsernamePassword>();
    const mockEnvironmentUrl = "https://contoso.crm.dynamics.com/";

    async function callActionWithMocks(): Promise<void> {
        const copilotPublish= await rewiremock.around(
            () => import("../actions/copilot-publish/index"),
            (mock) => {
                mock(() => import("@microsoft/powerplatform-cli-wrapper/dist/actions")).with({ copilotPublish: copilotPublishStub });
                mock(() => import("../lib/auth/getCredentials")).withDefault(() => credentials);
                mock(() => import("../lib/auth/getEnvironmentUrl")).withDefault(() => mockEnvironmentUrl);
                mock(() => import("../lib/runnerParameters")).with({ runnerParameters: runnerParameters });
            });
        await copilotPublish.main();
    }

    it("fetches parameters from index.ts, calls copilotPublishStub properly", async () => {

        await callActionWithMocks();

        copilotPublishStub.should.have.been.calledWithExactly({
            credentials: credentials,
            environmentUrl: mockEnvironmentUrl,
            botId: { name: 'bot-id', required: true, defaultValue: undefined },
            logToConsole: false,
        }, runnerParameters, new ActionsHost());
    });
});
